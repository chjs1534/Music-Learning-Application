const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MessagingTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    const {
      eventBody,
      requestContext: { routeKey, connectionId, domainName, stage },
      queryStringParameters = {},
    } = event;
    const { userId } = queryStringParameters;

    try {
        await dynamo.put(
            {
                TableName: tableName,
                Item: {
                    connectionId: connectionId,
                    userId: userId
                }
            }
        ).promise();
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = {connectionId: connectionId, userId: userId};
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};