/**
 * AWS Lambda function to add a match between two users in the "MatchTable".
 * 
 * - Adds a match between `userId1` and `userId2` if it does not already exist.
 * 
 * @param {Object} event - The event object.
 * @param {Object} event.body - The request body as a JSON string.
 * @param {string} event.body.userId1 - The ID of the first user in the match.
 * @param {string} event.body.userId2 - The ID of the second user in the match.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body, empty if successful or containing an error message.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if either userId1 or userId2 is missing or invalid.
 * - Returns HTTP 409 if the match already exists.
 * - Returns the appropriate HTTP status code and error message if there is an issue querying or updating the match table.
 */

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MatchTable";

exports.handler = async (event) => {
    let requestJSON = JSON.parse(event.body);
    const userId1 = requestJSON.userId1;
    const userId2 = requestJSON.userId2;
    // Error checks
    if (typeof userId1 !== 'string' || userId1.trim() === '' || typeof userId2 !== 'string' || userId2.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    
    // Check match exists
    let matches;
    try {
        matches = await dynamo.query({
            TableName: tableName,
            IndexName: "UserId2Index",
            KeyConditionExpression: "#uid2 = :userId2 AND #uid1 = :userId1",
            FilterExpression: "#request = :request",
            ExpressionAttributeNames: {
                "#uid2": "userId2",
                "#request": "request",
                "#uid1": "userId1"
            },
            ExpressionAttributeValues: {
                ":userId2": userId2,
                ":request": false,
                ":userId1": userId1
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
    if (matches.Items.length > 0) {
        return {
            statusCode: 409,
            body: JSON.stringify({ error: 'Match already exists' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Add match
    try {
        await dynamo.update(
            {
                TableName: tableName,
                Key: {
                    userId1: userId1,
                    userId2: userId2
                },
                UpdateExpression: "set #request = :match",
                ExpressionAttributeNames: {
                    "#request": "request"
                },
                ExpressionAttributeValues: {
                    ":match": false
                }
            }
        ).promise();
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};