const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let item;

    try {
        let userId;
        if (!event.pathParameters || !event.pathParameters.userId) {
            userId = event.userId
        } else {
            userId = event.pathParameters.userId;
        }
        
        if (typeof userId !== 'string' || userId.trim() === '') {
            const error = new Error('Invalid userId');
            error.statusCode = 400;
            throw error;
        }

        item = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId: userId
              },
            }
        ).promise();

        if (!item.Item) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
    } catch (err) {
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify(item.Item);
    }

    return {
        statusCode,
        body,
        headers,
    };
};