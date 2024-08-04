/**
 * AWS Lambda function to delete a user and all associated data
 * 
 * - Delete user from Cognito user pool
 * - Delete user from user database
 * - Delete user from match database
 * - Delete child users for a parent user
 * 
 * Environment Variables:
 * - USERPOOL_ID: The ID of the Cognito User Pool from which the user will be deleted
 * 
 * @param {Object} event - The event object
 * @param {Object} event.pathParameters - The path parameters
 * @param {string} event.pathParameters.userId - The Id of the user to be deleted
 * 
 * @returns {Object} response - The HTTP response object
 * @returns {number} response.statusCode - The HTTP status code
 * @returns {Object} response.body - The JSON-encoded response body containing either the deleted user's ID or an error message.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings
 *  
 * Internal Functions:
 * - getChildrenUsers(item): Fetches all child users associated with a parent user from the user database
 *   @param {Object} item - The DynamoDB key object for the parent user
 *   @returns {Array} A list of child user objects.
 * 
 * - doDeleteUser(item): All the deletes associated with a user
 *   @param {Object} item - The DynamoDB key object for the user to be deleted
 *   @returns {void}
 * 
 * Error Handling:
 * - Returns HTTP 500 if the USERPOOL_ID environment variable is not set.
 * - Returns HTTP 400 if the userId is missing or invalid.
 * - Returns errors if users not found from database
 * - Handles delete errors by logging only.
 */

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const cognito = new aws.CognitoIdentityServiceProvider();
const userPoolId = process.env.USERPOOL_ID

exports.handler = async (event) => {    
    // Error checks
    if (!userPoolId) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'USERPOOL_ID environment variable is not set' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    
    if (!event.pathParameters || !event.pathParameters.userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    const userId = event.pathParameters.userId;
    if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Get user type
    let item;
    item = {userId: userId}
    let userType;
    try {
        const currUser = await dynamo.get(
            {
              TableName: "UserTable",
              Key: item
            }
        ).promise();
        userType = currUser.Item.userType;
    } catch(err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    if (userType === "Parent") {
        // Get children users
        const children = await getChildrenUsers(item);
        
        // Delete children users
        for (let child of children) {
            await doDeleteUser({userId: child.userId});
        }
    }

    // Delete user
    await doDeleteUser(item);

    return {
        statusCode: 200,
        body: JSON.stringify(item),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};

const getChildrenUsers = async(item) => {
    let parentUser;
    try {
        parentUser = await dynamo.get(
            {
            TableName: "UserTable",
            Key: item
            }
        ).promise();
    } catch(err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Query by email
    const email = parentUser.Item.email;
    let childrenResult;
    try {
        childrenResult = await dynamo.query({
            TableName: "UserTable",
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
    } catch(err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    return childrenResult.Items;
}

const doDeleteUser = async(item) => {
    // Get user
    let user;
    try {
        user = await dynamo.get({
            TableName: "UserTable",
            Key: item
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

    // Delete from cognito user pool
    try {
        await cognito.adminDeleteUser({
            UserPoolId: userPoolId,
            Username: user.Item['username']
        }).promise();
    } catch (err) {
        console.error('Failed to delete from Cognito User Pool:', err);
    }
    
    // Delete from match database
    // Query as userId1
    let matches = [];
    try {
        const matches1 = await dynamo.query({
            TableName: "MatchTable",
            KeyConditionExpression: "#uid1 = :userId",
            ExpressionAttributeNames: {
                "#uid1": "userId1",
            },
            ExpressionAttributeValues: {
                ":userId": item.userId,
            }
        }).promise();
        matches = matches.concat(matches1.Items);
    } catch (err) {
        console.error('Failed to query from match database as userId1:', err);
    }
    
    // Query as userId2
    try {
        const matches2 = await dynamo.query({
            TableName: "MatchTable",
            IndexName: "UserId2Index",
            KeyConditionExpression: "#uid2 = :userId",
            ExpressionAttributeNames: {
                "#uid2": "userId2"
            },
            ExpressionAttributeValues: {
                ":userId": item.userId
            }
        }).promise();
        matches = matches.concat(matches2.Items);
    } catch (err) {
        console.error('Failed to query from match database as userId2:', err);
    }
    
    // Delete
    for (let match of matches) {
        try {
            await dynamo.delete({
                TableName: "MatchTable",
                Key: {
                    userId1: match.userId1,
                    userId2: match.userId2
                }
            }).promise();
        } catch(err) {
            console.error('Failed to delete from match database', err);
        }
    }
    
    // Delete from user database
    try {
        await dynamo.delete({
            TableName: "UserTable",
            Key: item
        }).promise();
    } catch (err) {
        console.error('Failed to delete from User DynamoDB:', err);
    }
}