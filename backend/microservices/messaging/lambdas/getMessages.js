const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "MessagesTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let item;
    const userId1 = event.pathParameters.userId1 >= event.pathParameters.userId2 ? event.pathParameters.userId1 : event.pathParameters.userId2;
    const userId2 = event.pathParameters.userId1 >= event.pathParameters.userId2 ? event.pathParameters.userId2 : event.pathParameters.userId1;

    try {
        item = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId1: userId1,
                userId2: userId2
              },
            }
        ).promise();
    } catch (err) {
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify( { "messages": item.Item.messages });
    }

    return {
        statusCode,
        body,
        headers,
    };
};