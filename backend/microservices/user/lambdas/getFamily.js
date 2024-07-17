const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const crypto = require("crypto");

const tableName = "UserTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    try {
        let parentUser = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId: event.pathParameters.userId,
              },
            }
        ).promise();
        let email = parentUser.Item.email
    
        // Query as email
        const params1 = {
            TableName: tableName,
            IndexName: "EmailIndex",
            KeyConditionExpression: "#email = :email",
            FilterExpression: "#userType = :userType",
            ExpressionAttributeNames: {
                "#email": "email",
                "#userType": "userType"
            },
            ExpressionAttributeValues: {
                ":email": email,
                ":userType": "Child"
            }
        };
        body =  await dynamo.query(params1).promise();
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