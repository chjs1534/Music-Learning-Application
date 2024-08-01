const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    let userId;
    // Error checks
    if (!event.pathParameters || !event.pathParameters.userId) {
        userId = event.userId;
    } else {
        userId = event.pathParameters.userId;
    }

    if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Get current user
    let currUser;
    try {
        currUser = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId: userId,
              },
            }
        ).promise();
        if (!currUser.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            };
        }
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    const email = currUser.Item.email;
    const userType = currUser.Item.userType;
    let users;

    if (userType === "Parent") {
        // Query for children
        try {
            users = await dynamo.query({
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
            }).promise();
        } catch (err) {
            return {
                statusCode: err.statusCode,
                body: JSON.stringify({ error: err.message }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            };
        }
    } else if (userType === "Child") {
        try {
            users = await dynamo.query({
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
            }).promise();
        } catch (err) {
            return {
                statusCode: err.statusCode,
                body: JSON.stringify({ error: err.message }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            };
        }
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userType' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({users: users.Items}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};