const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const crypto = require("crypto");

const tableName = "UserTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    try {
        let uuid = crypto.randomUUID();
        let requestJSON = JSON.parse(event.body);
        body = await dynamo.put(
            {
                TableName: tableName,
                Item: {
                    userId: uuid,
                    email: requestJSON.email,
                    username: requestJSON.username,
                    userType: requestJSON.userType,
                    firstName: requestJSON.firstName,
                    lastName: requestJSON.lastName
                },
            }
        ).promise();
        body = {userId: uuid};
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};