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
    const page = event.queryStringParameters.page;
    const limit = event.queryStringParameters.limit;
    let msgs = [];

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
        const allMsgs = item.Item.messages;
        const totalMessages = allMsgs.length;
        const start = Math.max(totalMessages - (page * limit), 0);
        const end = totalMessages - ((page - 1) * limit);
        msgs = allMsgs.slice(start, end);
    } catch (err) {
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify( { "messages": msgs });
    }

    return {
        statusCode,
        body,
        headers,
    };
};