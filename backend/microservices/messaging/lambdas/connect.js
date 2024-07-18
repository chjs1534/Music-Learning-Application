const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MessagingTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    const connectionId = event.requestContext.connectionId;

    try {
        await dynamo.put(
            {
                TableName: tableName,
                Item: {
                    connectionId: connectionId
                }
            }
        ).promise();
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = {connectionId: connectionId};
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};