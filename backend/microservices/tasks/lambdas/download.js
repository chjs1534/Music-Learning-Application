const { GetObjectCommand, S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

BUCKET_NAME = 'gently-weekly-tough-lion'

const s3Client = new S3Client({});

/**
 * AWS Lambda handler to get a download URL of a task's attached file.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event parameters:
 * @param {string} studentId     The ID of the student who has been assigned the task.
 * @param {string} taskId        The ID of the task
 * @param {string} filename      The filename of the file attached to the task.
 * 
 * Response body:
 * @param {string} downloadUrl   A S3 presigned URL. Use a GET request to download file.
 */
exports.handler = async (event, context, callback) => {
  const studentId = event.queryStringParameters.studentId;
  const taskId = event.queryStringParameters.taskId;
  const filename = event.queryStringParameters.filename;

  const params = {
    Bucket: BUCKET_NAME,
    Key: `${studentId}/${taskId}/${filename}`,
  };

  // check if objects exist
  try {
    await s3Client.send(new HeadObjectCommand(params));
  } catch (e) {
    if (e.name === 'NotFound') {
      return {
        statusCode: 422,
        body: JSON.stringify({
          error: 'Object does not exist in S3.'
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
      };
    }
  }

  const downloadUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand(params),
    { expiresIn: 3600 },
  );

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
        downloadUrl: downloadUrl,
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}
