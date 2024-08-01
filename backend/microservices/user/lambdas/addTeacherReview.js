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
