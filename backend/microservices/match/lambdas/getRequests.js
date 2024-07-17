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
        body = await query(event.pathParameters.userId);
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        const newBody = body.Items.map(item => ({ userId: item.userId1 }));
        body = JSON.stringify({requests: newBody});
    }

    return {
        statusCode,
        body,
        headers,
    };
};

const query = async (userId) => {
    // Query as userId2
    const params = {
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
            ":request": true
        }
    };
    const result2 = await dynamo.query(params).promise();

    return result2;
};