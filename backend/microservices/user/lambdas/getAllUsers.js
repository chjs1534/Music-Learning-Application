const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = 'UserTable';

exports.handler = async (event) => {
    let lastEvaluatedKey = null;
    const items = [];
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    try {
        do {
            const params = {
                TableName: tableName,
                ExclusiveStartKey: lastEvaluatedKey,
            };

            const data = await dynamo.scan(params).promise();
            items.push(...data.Items);
            lastEvaluatedKey = data.LastEvaluatedKey;

        } while (lastEvaluatedKey);

        return {
            statusCode: 200,
            body: JSON.stringify({ items: items }),
            headers: headers,
        };

    } catch (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to scan the table', details: err.message }),
            headers: headers,
        };
    }
};
