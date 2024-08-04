const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

/**
 * AWS Lambda handler to get the comments on a user's video.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event parameters:
 * @param {string} userId       The ID of the user whose videos comments are being requested.
 * @param {string} fileId       The ID of the video.
 * 
 * Response body:
 * @param {list} comments       A list of comment objects.
 */
exports.handler = async (event, context, callback) => {
  try {
    const userId = event.queryStringParameters.userId;
    const fileId = event.queryStringParameters.fileId;

    if (!userId || !fileId) {
      throw new Error('Missing required query string parameters');
    }

    const response = await docClient.send(new GetCommand({
      TableName: 'VideosTable',
      Key: {
        userId: `${userId}`,
        fileId: `${fileId}`,
      },
    }));

    if (!reponse || !response.Item || ! response.comments) {
      throw new Error('Could not find item in database.')
    }

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
    let statusCode = 400;
    let message = e.message;

    if (message.includes('Missing required body parameters')) {
      statusCode = 400;
    } else if (message.includes('Could not find item in database.')) {
      statusCode = 422;
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