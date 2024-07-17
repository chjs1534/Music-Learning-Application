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
    let uuid = crypto.randomUUID();
    let item;

    try {
        let requestJSON = JSON.parse(event.body);
        if (requestJSON.userType == "Child") {
            let parentUser = await dynamo.get(
                {
                  TableName: tableName,
                  Key: {
                    userId: requestJSON.userId
                  },
                }
            ).promise();
            let email = parentUser.Item.email
            item = {
                userId: uuid,
                email: email,
                username: requestJSON.username,
                userType: requestJSON.userType,
                firstName: requestJSON.firstName,
                lastName: requestJSON.lastName,
                aboutMe: ""
            };
        
            await dynamo.put(
                {
                    TableName: tableName,
                    Item: item,
                }
            ).promise();
        } else {
            item = {
                userId: uuid,
                email: requestJSON.email,
                username: requestJSON.username,
                userType: requestJSON.userType,
                firstName: requestJSON.firstName,
                lastName: requestJSON.lastName,
                aboutMe: ""
            };
        
            await dynamo.put(
                {
                    TableName: tableName,
                    Item: item,
                }
            ).promise();
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = {userId: item.userId, userType: item.userType, email: item.email};
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};