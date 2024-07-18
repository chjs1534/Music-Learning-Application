const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "UserTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    try {
        let requestJSON = JSON.parse(event.body);
        if (requestJSON.hasOwnProperty(aboutMe) && requestJSON.aboutMe != "") {
            body = await dynamo.update(
                {
                    TableName: tableName,
                    Key: {
                        userId: requestJSON.userId
                    },
                    UpdateExpression: "set #aboutMe = :aboutMe",
                    ExpressionAttributeNames: {
                        "#aboutMe": "aboutMe"
                    },
                    ExpressionAttributeValues: {
                        ":aboutMe": requestJSON.aboutMe
                    }
                }
            ).promise();
            // body = {aboutMe: requestJSON.aboutMe};
        }
        if (requestJSON.hasOwnProperty(firstName) && requestJSON.firstName != "") {
            body = await dynamo.update(
                {
                    TableName: tableName,
                    Key: {
                        userId: requestJSON.userId
                    },
                    UpdateExpression: "set #firstName = :firstName",
                    ExpressionAttributeNames: {
                        "#firstName": "firstName"
                    },
                    ExpressionAttributeValues: {
                        ":firstName": requestJSON.firstName
                    }
                }
            ).promise();
            // body = {firstName: requestJSON.firstName};
        }
        if (requestJSON.hasOwnProperty(lastName) && requestJSON.lastName != "") {
            body = await dynamo.update(
                {
                    TableName: tableName,
                    Key: {
                        userId: requestJSON.userId
                    },
                    UpdateExpression: "set #lastName = :lastName",
                    ExpressionAttributeNames: {
                        "#lastName": "lastName"
                    },
                    ExpressionAttributeValues: {
                        ":lastName": requestJSON.lastName
                    }
                }
            ).promise();
            // body = {lastName: requestJSON.lastName};
        }
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