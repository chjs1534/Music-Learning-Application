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
        body = await dynamo.delete(
            {
                TableName: tableName,
                Key: {
                    userId1: requestJSON.userId1,
                    userId2: requestJSON.userId2
                },
            }
        ).promise();
        body = await dynamo.delete(
            {
                TableName: tableName,
                Key: {
                    userId1: requestJSON.userId2,
                    userId2: requestJSON.userId1
                },
            }
        ).promise();
        body = {message: "Removed match"};
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