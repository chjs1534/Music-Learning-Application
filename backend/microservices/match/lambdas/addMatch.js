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
        let [userId1, userId2] = [requestJSON.userId1, requestJSON.userId2].sort();
        body = await dynamo.put(
            {
                TableName: tableName,
                Item: {
                    userId1: userId1,
                    userId2: userId2
                },
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