/**
 * AWS Lambda function to add a review for a teacher in the "UserTable".
 * 
 * - Adds a review with a rating and message to the "teacherReviews" list of the specified teacher.
 * 
 * @param {Object} event - The event object.
 * @param {Object} event.body - The request body as a JSON string.
 * @param {string} event.body.userId - The ID of the teacher to whom the review will be added.
 * @param {number} event.body.rating - The rating given to the teacher (0-5).
 * @param {string} event.body.reviewMsg - The review message.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body containing the updated user data or an error message.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if the userId, rating, or reviewMsg is missing or invalid.
 * - Returns HTTP 404 if the user is not found in the database.
 * - Returns HTTP 400 if the user is not a teacher.
 * - Returns the appropriate HTTP status code and error message if there is an issue updating the user table.
 */

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    const requestJSON = JSON.parse(event.body);
    const userId = requestJSON.userId;
    const rating = requestJSON.rating;
    const reviewMsg = requestJSON.reviewMsg;
    // Error checks
    if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    if (typeof reviewMsg !== 'string' || reviewMsg.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid reviewMsg' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid rating' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    // Check user type
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
    if (user.Item.userType !== "Teacher") {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userType' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Add review
    try {
        user = await dynamo.update(
            {
                TableName: tableName,
                Key: {
                    userId: userId,
                },
                UpdateExpression: 'SET teacherReviews = list_append(if_not_exists(teacherReviews, :empty_list), :newReview)',
                ExpressionAttributeValues: {
                ':empty_list': [],
                ':newReview': [
                    { 'rating': rating, 'reviewMsg': reviewMsg }
                ]
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
        body: JSON.stringify(user),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};
