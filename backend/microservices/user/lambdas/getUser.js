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
        const userId = event.pathParameters.userId;
        body = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId: userId
              },
            }
          ).promise();
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body.Item);
    }

    return {
        statusCode,
        body,
        headers,
    };
};