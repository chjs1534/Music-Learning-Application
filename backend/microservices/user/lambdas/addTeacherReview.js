const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let item;

    try {
        let requestJSON = JSON.parse(event.body);
        await dynamo.update(
            {
                TableName: tableName,
                Key: {
                    userId: requestJSON.userId,
                },
                UpdateExpression: 'SET teacherReviews = list_append(if_not_exists(teacherReviews, :empty_list), :newReview)',
                ExpressionAttributeValues: {
                ':empty_list': [],
                ':newReview': [
                    { 'rating': requestJSON.rating, 'reviewMsg': requestJSON.reviewMsg }
                ]
                }
            }
        ).promise();
    } catch (err) {
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify(item.Item);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
