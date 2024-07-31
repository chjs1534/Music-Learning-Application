const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

exports.handler = async (event, context, callback) => {
  try {
    const userId = event.queryStringParameters.userId;
    const fileId = event.queryStringParameters.fileId;
 
    const response = await docClient.send(new GetCommand({
      TableName: 'VideosTable',
      Key: {
        userId: `${userId}`,
        fileId: `${fileId}`,
      },
    }));
    console.log(response);
    console.log(response.Item)
    console.log(response.Item.comments)

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        comments: response.Item.comments
      }),
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.log(e)
    callback(null, {
      statusCode: 200,
      body: {
        res: e
      },
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  }
}