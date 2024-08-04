/**
 * AWS Lambda function to delete a match between two users.
 * 
 * - Removes match entries from the `MatchTable` where the specified users are involved.
 * 
 * @param {Object} event - The event object containing the request data.
 * @param {Object} event.body - The request body as a JSON string.
 * @param {string} event.body.userId1 - The ID of the first user involved in the match.
 * @param {string} event.body.userId2 - The ID of the second user involved in the match.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if any of the `userId` values are invalid.
 * - Returns HTTP 500 if there is an issue deleting the entries from DynamoDB.
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

    // Do delete
    try {
        body = await dynamo.delete(
            {
                TableName: tableName,
                Key: {
                    userId1: userId1,
                    userId2: userId2
                },
            }
        ).promise();
        body = await dynamo.delete(
            {
                TableName: tableName,
                Key: {
                    userId1: userId2,
                    userId2: userId1
                },
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