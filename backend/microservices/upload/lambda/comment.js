const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);

    const userId = requestBody.userId
    const fileId = requestBody.fileId
    const authorId = requestBody.authorId
    const videoTime = requestBody.videoTime
    const commentText = requestBody.commentText

    docClient.send(new UpdateCommand({
      TableName: 'VideosTable',
      Key: {
        userId: `${userId}`,
        fileId: `${fileId}`,
      },
      UpdateExpression: 'SET comments = list_append(comments, :new_comment)',
      ExpressionAttributeValues: {
        ':new_comment': [
          { 'commentText': commentText, 'videoTime': videoTime, 'authorId': authorId, 'timestamp': new Date().toLocaleString() }
        ]
      },
    }));

    callback(null, {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.log(e)
  }
}