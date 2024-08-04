const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "MatchTable";

exports.handler = async (event) => {
    let requestJSON = JSON.parse(event.body);
    const userId1 = requestJSON.userId1;
    const userId2 = requestJSON.userId2;
    // Error checks
    if (typeof userId1 !== 'string' || userId1.trim() === '' || typeof userId2 !== 'string' || userId2.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Do delete
    try {
        body = await dynamo.delete(
            {
                TableName: tableName,
                Key: {
                    userId1: userId1,
                    userId2: userId2
                },
            }
        ).promise();
        body = await dynamo.delete(
            {
                TableName: tableName,
                Key: {
                    userId1: userId2,
                    userId2: userId1
                },
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