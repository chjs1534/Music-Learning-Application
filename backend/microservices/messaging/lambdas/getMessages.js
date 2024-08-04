/**
 * AWS Lambda function to retrieve messages between two users from DynamoDB.
 * 
 * - Retrieves messages stored in the `MessagesTable` for the given user IDs.
 * 
 * @param {Object} event - The event object containing details for retrieving messages.
 * @param {Object} event.pathParameters - The parameters in the URL path.
 * @param {string} event.pathParameters.userId1 - The ID of the first user.
 * @param {string} event.pathParameters.userId2 - The ID of the second user.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code (200 if successful, or error code if an error occurs).
 * @returns {Object} response.body - The JSON-encoded response body containing the messages between the two users.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 500 if there is an issue with retrieving data from DynamoDB.
*/

const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "MessagesTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let item;
    const userId1 = event.pathParameters.userId1 >= event.pathParameters.userId2 ? event.pathParameters.userId1 : event.pathParameters.userId2;
    const userId2 = event.pathParameters.userId1 >= event.pathParameters.userId2 ? event.pathParameters.userId2 : event.pathParameters.userId1;

    try {
        item = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId1: userId1,
                userId2: userId2
              },
            }
        ).promise();
    } catch (err) {
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify( { "messages": item.Item.messages });
    }

    return {
        statusCode,
        body,
        headers,
    };
};