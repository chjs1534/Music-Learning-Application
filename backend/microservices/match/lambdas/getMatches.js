const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "MatchTable";

exports.handler = async (event) => {
    let userId;
    if (!event.pathParameters || !event.pathParameters.userId) {
        userId = event.userId;
    } else {
        userId = event.pathParameters.userId;
    }

    let matches = [];
    try {
        const matches1 = await dynamo.query({
            TableName: tableName,
            KeyConditionExpression: "#uid1 = :userId",
            FilterExpression: "#request = :request",
            ExpressionAttributeNames: {
                "#uid1": "userId1",
                "#request": "request"
            },
            ExpressionAttributeValues: {
                ":userId": userId,
                ":request": false
            }
        }).promise();
        matches = matches.concat(matches1.Items);
    } catch (err) {
        console.err("Failed to get matches as userId1");
    }

    try {
        const matches2 = await dynamo.query({
            TableName: tableName,
            IndexName: "UserId2Index",
            KeyConditionExpression: "#uid2 = :userId",
            FilterExpression: "#request = :request",
            ExpressionAttributeNames: {
                "#uid2": "userId2",
                "#request": "request"
            },
            ExpressionAttributeValues: {
                ":userId": userId,
                ":request": false
            }
        }).promise();
        matches = matches.concat(matches2.Items);
    } catch (err) {
        console.err("Failed to get matches as userId2");
    }
    const newBody = matches.map(item => ({ userId: userId == item.userId1 ? item.userId2 : item.userId1 }));

    return {
        statusCode: 200,
        body: JSON.stringify({matches: newBody}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
}