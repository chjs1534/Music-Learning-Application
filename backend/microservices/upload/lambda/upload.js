const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({});

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const userId = requestBody.userId;

  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: "lately-hideously-humane-colt",
      Key: `${userId}/${Date.now()}.mp4`,
    }),
    { expiresIn: 600 },
  );

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
        uploadURL: uploadUrl,
        filename: `${Date.now()}.mp4`,
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}