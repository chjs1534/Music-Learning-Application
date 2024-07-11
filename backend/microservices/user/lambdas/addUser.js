const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "UserTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;

    try {
        let requestJSON = JSON.parse(event.body);
        await dynamo.send(
            new PutCommand({
                TableName: tableName,
                Item: {
                    AccountId: requestJSON.email,
                    UserId: requestJSON.username,
                    UserType: requestJSON.usertype,
                    FirstName: requestJSON.firstname,
                    LastName: requestJSON.lastname,
                },
            })
        );
        body = `Put user ${requestJSON.email}, ${requestJSON.username}`;
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