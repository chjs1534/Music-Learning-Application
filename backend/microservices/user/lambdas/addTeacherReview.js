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
        await dynamo.update(
            {
                TableName: tableName,
                Key: {
                    userId1: event.pathParameters.userId,
                },
                UpdateExpression: 'SET messages = list_append(if_not_exists(messages, :empty_list), :new_message)',
                ExpressionAttributeValues: {
                ':empty_list': [],
                ':new_message': [
                    { 'senderId': senderId, 'receiverId': receiverId, 'msg': msg, 'time':new Date().toISOString() }
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
