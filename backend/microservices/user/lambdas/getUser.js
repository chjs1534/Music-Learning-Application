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