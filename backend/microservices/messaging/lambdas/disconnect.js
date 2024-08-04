const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MessagingTable";

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    try {
        await dynamo.delete(
            {
                TableName: tableName,
                Key: {
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