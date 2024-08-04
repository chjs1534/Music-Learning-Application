/**
 * AWS Lambda function to store a WebSocket connection ID in the `MessagingTable`.
 * 
 * - Stores the WebSocket connection ID from the request context into the `MessagingTable`.
 * 
 * @param {Object} event - The event object containing the WebSocket connection details.
 * @param {Object} event.requestContext - The context of the WebSocket request.
 * @param {string} event.requestContext.connectionId - The WebSocket connection ID to be stored.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 500 if there is an issue storing the connection ID in DynamoDB.
 */


const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "MessagingTable";

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    try {
        await dynamo.put(
            {
                TableName: tableName,
                Item: {
                    connectionId: connectionId
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