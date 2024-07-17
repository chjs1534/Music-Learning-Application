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
        body = {newAboutMe: requestJSON.aboutMe};
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