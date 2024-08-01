const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = 'UserTable';

exports.handler = async (event) => {
    let lastEvaluatedKey = null;
    const items = [];
    const headers = {
        'Access-Control-Allow-Origin': '*', // If you need CORS headers
    };

    try {
        do {
            const params = {
                TableName: tableName,
                ExclusiveStartKey: lastEvaluatedKey,  // For pagination, if necessary
            };

            const data = await dynamo.scan(params).promise();
            items.push(...data.Items);  // Add the scanned items to the array
            lastEvaluatedKey = data.LastEvaluatedKey;  // Get the last evaluated key for pagination

        } while (lastEvaluatedKey);  // Continue scanning if there are more items

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
