const { GetObjectCommand, S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

BUCKET_NAME = 'gently-weekly-tough-lion'

const s3Client = new S3Client({});

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
