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
    
    // Check match exists
    let matches;
    try {
        matches = await dynamo.query({
            TableName: tableName,
            IndexName: "UserId2Index",
            KeyConditionExpression: "#uid2 = :userId2 AND #uid1 = :userId1",
            FilterExpression: "#request = :request",
            ExpressionAttributeNames: {
                "#uid2": "userId2",
                "#request": "request",
                "#uid1": "userId1"
            },
            ExpressionAttributeValues: {
                ":userId2": userId2,
                ":request": false,
                ":userId1": userId1
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
    if (matches.Items.length > 0) {
        return {
            statusCode: 409,
            body: JSON.stringify({ error: 'Match already exists' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Add match
    try {
        await dynamo.update(
            {
                TableName: tableName,
                Key: {
                    userId1: userId1,
                    userId2: userId2
                },
                UpdateExpression: "set #request = :match",
                ExpressionAttributeNames: {
                    "#request": "request"
                },
                ExpressionAttributeValues: {
                    ":match": false
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