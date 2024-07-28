const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "UserTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    
    try {
        body = await queryUsersByType(event.pathParameters.userType);
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify({users: body.Items});
    }

    return {
        statusCode,
        body,
        headers,
    };
};

const queryUsersByType = async (userType) => {
    // Query by usertype
    const params1 = {
        TableName: tableName,
        IndexName: "UserTypeIndex",
        KeyConditionExpression: "#uType = :userType",
        ExpressionAttributeNames: {
            "#uType": "userType"
        },
        ExpressionAttributeValues: {
            ":userType": userType
        }
    };
    return await dynamo.query(params1).promise();
};