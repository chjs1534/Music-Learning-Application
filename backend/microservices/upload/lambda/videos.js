const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({});
BUCKET_NAME = "truly-entirely-hip-raccoon";

/**
 * AWS Lambda handler to get a list of videos that a user has uploaded.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event parameters:
 * @param {string} userId    The ID of the user whose videos are being requested.
 * 
 * Response body:
 * @param {list} fileIds     A list of fileId strings.
 */
exports.handler = async (event, context, callback) => {
  try {
    const userId = event.queryStringParameters.userId;

    if (!userId) {
      throw new Error('Missing required query string parameters.');
    }

    const command = new ListObjectsV2Command({
      'Bucket': BUCKET_NAME,
      'Prefix': `${userId}/`
    });
    const response = await s3Client.send(command);

    const fileIds = [];

    if (response.Contents) {
      for (const obj of response.Contents) {
        fileIds.push(obj.Key.split('/')[1]);
      }
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        fileIds: [...new Set(fileIds)] // remove duplicates
      }),
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    let statusCode = 400;
    let message = e.message;

    if (message.includes('Missing query string parameters.')) {
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