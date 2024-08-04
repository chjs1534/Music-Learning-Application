/**
 * AWS Lambda function to retrieve users based on their userType from the "UserTable".
 * 
 * - Fetches all users with a specific userType from the DynamoDB table.
 * 
 * @param {Object} event - The event object.
 * @param {Object} event.pathParameters - The path parameters.
 * @param {string} event.pathParameters.userType - The type of users to retrieve ("Child", "Parent", "Student", "Teacher").
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body containing the list of users or an error message.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if the userType is missing, invalid, or not one of the allowed values ("Child", "Parent", "Student", "Teacher").
 * - Returns the appropriate HTTP status code and error message if there is an issue accessing the user table or querying users.
 */

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    let userType;
    // Error checks
    if (!event.pathParameters || !event.pathParameters.userType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userType' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    userType = event.pathParameters.userType;
    if (typeof userType !== 'string' || userType.trim() === '' || 
        (userType !== "Child" && userType !== "Parent" && userType !== "Student" && userType !== "Teacher")) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userType' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Get users
    let users;
    try {
        users = await dynamo.query({
            TableName: tableName,
            IndexName: "UserTypeIndex",
            KeyConditionExpression: "#uType = :userType",
            ExpressionAttributeNames: {
                "#uType": "userType"
            },
            ExpressionAttributeValues: {
                ":userType": userType
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

    return {
        statusCode: 200,
        body: JSON.stringify({users: users.Items}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};
