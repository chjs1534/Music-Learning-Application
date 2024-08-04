/**
 * AWS Lambda function to retrieve a user's details.
 * 
 * - Fetches a user's data from the "UserTable" based on the provided userId.
 * 
 * @param {Object} event - The event object.
 * @param {Object} event.pathParameters - The path parameters.
 * @param {string} [event.pathParameters.userId] - The Id of the user to be retrieved.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code. 
 * @returns {Object} response.body - The JSON-encoded response body containing the user's data or an error message.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if the userId is missing or invalid.
 * - Returns HTTP 404 if the user is not found in the database.
 * - Returns the appropriate HTTP status code and error message if there is an issue accessing the user table.
 */

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    let userId;
    // Error checks
    if (!event.pathParameters || !event.pathParameters.userId) {
        userId = event.userId
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

    // Get user
    let user;
    try {
        user = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId: userId
              },
            }
        ).promise();
        if (!user.Item) {
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

    return {
        statusCode: 200,
        body: JSON.stringify(user.Item),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};