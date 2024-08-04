const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

/**
 * AWS Lambda handler to put a comment by a user on another user's video.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event body:
 * @param {string} userId       The ID of the user whose videos is being commented on.
 * @param {string} fileId       The ID of the video which is being commented on.
 * @param {string} authorId     The ID of the user making the comment
 * @param {string} videoTime    A timestamp of the video that the comment is related to.
 * @param {string} commentText  The comment text.
 */
exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);

    const userId = requestBody.userId
    const fileId = requestBody.fileId
    const authorId = requestBody.authorId
    const videoTime = requestBody.videoTime
    const commentText = requestBody.commentText

    if (!userId || !fileId || !authorId || !videoTime || !commentText) {
      throw new Error('Missing required body parameters');
    }

    try {
      // append comment to 'comments' list attribute in database
      docClient.send(new UpdateCommand({
        TableName: 'VideosTable',
        Key: {
          userId: `${userId}`,
          fileId: `${fileId}`,
        },
        UpdateExpression: 'SET comments = list_append(if_not_exists(comments, :empty_list), :new_comment)',
        ExpressionAttributeValues: {
          ':empty_list': [],
          ':new_comment': [
            { 'commentText': commentText, 'videoTime': videoTime, 'authorId': authorId, 'timestamp': new Date().toLocaleString() }
          ]
        },
      }));
    } catch (dbError) {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not update comments in DynamoDB' }),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    callback(null, {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    let statusCode = 400;
    let message = e.message;

    if (message.includes('Missing required body parameters')) {
      statusCode = 400;
    } else {
      statusCode = 500;
      message = 'Internal Server Error';
    }

    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify({ error: message }),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}