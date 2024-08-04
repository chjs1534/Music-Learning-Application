/**
 * AWS Lambda function to retrieve a user's related data (children for a parent user or parent for a child user).
 * 
 * - Fetches a user's data from the "UserTable" based on the provided userId.
 * - If the user is a parent, retrieves all associated child users.
 * - If the user is a child, retrieves the associated parent user.
 * 
 * @param {Object} event - The event object.
 * @param {Object} event.pathParameters - The path parameters.
 * @param {string} [event.pathParameters.userId] - The ID of the user whose related data is to be retrieved.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code. 
 * @returns {Object} response.body - The JSON-encoded response body containing the related users' data or an error message.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if the userId is missing, invalid, or if the userType is invalid.
 * - Returns HTTP 404 if the user is not found in the database.
 * - Returns the appropriate HTTP status code and error message if there is an issue accessing the user table or querying related users.
 */

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