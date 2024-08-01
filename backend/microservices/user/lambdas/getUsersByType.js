const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    let userType;
    // Error checks
    if (!event.pathParameters || !event.pathParameters.userType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userType' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    userType = event.pathParameters.userType;
    if (typeof userType !== 'string' || userType.trim() === '' || 
        (userType !== "Child" && userType !== "Parent" && userType !== "Student" && userType !== "Teacher")) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userType' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

    // Get users
    let users;
    try {
        users = await dynamo.query({
            TableName: tableName,
            IndexName: "UserTypeIndex",
            KeyConditionExpression: "#uType = :userType",
            ExpressionAttributeNames: {
                "#uType": "userType"
            },
            ExpressionAttributeValues: {
                ":userType": userType
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

    return {
        statusCode: 200,
        body: JSON.stringify({users: users.Items}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};
