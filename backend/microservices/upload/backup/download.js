const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({});

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const userId = requestBody.userId;
  const filename = requestBody.filename;

  const downloadUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: "truly-entirely-hip-raccoon",
      Key: `${userId}/${filename}`,
    }),
    { expiresIn: 600 },
  );

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
        downloadURL: downloadUrl
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}