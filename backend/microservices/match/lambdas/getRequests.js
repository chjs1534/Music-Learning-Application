const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MatchTable";

exports.handler = async (event) => {
    const userId = event.pathParameters.userId;

    let requests = [];
    try {
        const requests1 = await dynamo.query({
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
        }).promise();
        requests = requests1.Items;
    } catch (err) {
        console.err("Failed to get requests");
    }
    const newBody = requests.map(item => ({ userId: item.userId1 }));
    
    return {
        statusCode: 200,
        body: JSON.stringify({requests: newBody}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};

