/**
 * AWS Lambda function to retrieve all match requests for a given user from the "MatchTable".
 * 
 * - Fetches match requests.
 * 
 * @param {Object} event - The event object.
 * @param {Object} event.pathParameters - The path parameters.
 * @param {string} [event.pathParameters.userId] - The ID of the user whose matches are to be retrieved.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body containing an array of user IDs involved in the matches.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if the userId is missing or invalid.
 * - Returns HTTP 500 if there is an issue querying the match table.
 */


const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "MatchTable";

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