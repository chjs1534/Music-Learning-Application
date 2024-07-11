const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "UserTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;

    try {
        let requestJSON = JSON.parse(event.body);
        body = await dynamo.send(
            new GetCommand({
              TableName: tableName,
              Key: {
                AccountId: requestJSON.email,
                UserId: requestJSON.username
              },
            })
          );
          body = body.Item;
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