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
        body = await queryPairs(event.pathParameters.userId);
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

const queryPairs = async (userId) => {
    // Query as userId1
    const params1 = {
        TableName: tableName,
        KeyConditionExpression: "#uid1 = :userId",
        ExpressionAttributeNames: {
            "#uid1": "userId1"
        },
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };
    const result1 = await dynamo.query(params1).promise();

    // Query as userId2
    const params2 = {
        TableName: tableName,
        IndexName: "UserId2Index",
        KeyConditionExpression: "#uid2 = :userId",
        ExpressionAttributeNames: {
            "#uid2": "userId2"
        },
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };
    const result2 = await dynamo.query(params2).promise();

    return result1.Items.concat(result2.Items);
};