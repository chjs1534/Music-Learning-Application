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
        let userId;
        if (!event.pathParameters || !event.pathParameters.userId) {
            userId = event.userId;
        } else {
            userId = event.pathParameters.userId;
        }

        // Get email of user
        let currUser = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId: userId,
              },
            }
        ).promise();
        let email = currUser.Item.email
        
        let params1;
        if (currUser.Item.userType === "Parent") {
            // Query for children
            params1 = {
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
        } else {
            // Query for parent
            params1 = {
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
                    ":userType": "Parent"
                }
            };
        }
        
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