const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();
const cognito = new aws.CognitoIdentityServiceProvider();
const tableName = "UserTable";
const userPoolId = process.env.USERPOOL_ID

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let item;

    try {
        if (!userPoolId) {
            throw new Error('USERPOOL_ID environment variable is not set');
        }
        
        if (!event.pathParameters || !event.pathParameters.userId) {
            const error = new Error('Missing pathParameters or userId');
            error.statusCode = 400;
            throw error;
        }
        const userId = event.pathParameters.userId;
        if (typeof userId !== 'string' || userId.trim() === '') {
            const error = new Error('Invalid userId');
            error.statusCode = 400;
            throw error;
        }
        
        item = {userId: userId}
        let user
        try {
            user = await dynamo.get({
                TableName: tableName,
                Key: item
            }).promise();

            await cognito.adminDeleteUser({
                UserPoolId: userPoolId,
                Username: user.Item['username']
            }).promise();
        } catch (cognitoError) {
            console.error('Failed to delete from Cognito User Pool:', cognitoError);
        }

        try {
            await dynamo.delete({
                TableName: tableName,
                Key: item
            }).promise();
        } catch (dynamoError) {
            console.error('Failed to delete from DynamoDB:', dynamoError);
        }
    } catch (err) {
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify(item);
    }

    return {
        statusCode,
        body,
        headers,
    };
};