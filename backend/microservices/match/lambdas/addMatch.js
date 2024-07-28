const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MatchTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    try {
        let requestJSON = JSON.parse(event.body);
        body = await dynamo.update(
            {
                TableName: tableName,
                Key: {
                    userId1: requestJSON.userId1,
                    userId2: requestJSON.userId2
                },
                UpdateExpression: "set #request = :match",
                ExpressionAttributeNames: {
                    "#request": "request"
                },
                ExpressionAttributeValues: {
                    ":match": false
                }
            }
        ).promise();
        body = {message: "Match added"};
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};