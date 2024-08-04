/**
 * AWS Lambda function to retrieve match requests for a given user.
 * 
 * - Retrieves match requests where the specified user is the recipient.
 * 
 * @param {Object} event - The event object.
 * @param {Object} event.pathParameters - The path parameters.
 * @param {string} event.pathParameters.userId - The ID of the user whose match requests are to be retrieved.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body containing the list of match requests for the user.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if the `userId` is not provided or invalid.
 * - Returns HTTP 500 if there is an issue querying the DynamoDB table.
 */

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "MatchTable";

exports.handler = async (event) => {
    let userId;
    // Error checks
    if (!event.pathParameters || !event.pathParameters.userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid input' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    userId = event.pathParameters.userId;
    if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    let requests;
    try {
        requests = await dynamo.query({
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
                ":request": true
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
    const newBody = requests.Items.map(item => ({ userId: item.userId1 }));
    
    return {
        statusCode: 200,
        body: JSON.stringify({requests: newBody}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};

