const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

BUCKET_NAME = "truly-entirely-hip-raccoon"

const s3Client = new S3Client({});

exports.handler = async (event, context, callback) => {
  const userId = event.queryStringParameters.userId;
  const fileId = event.queryStringParameters.fileId;
  const isRef = event.queryStringParameters?.isRef === '';
  console.log(event.queryStringParameters)
  console.log(isRef)
  const filename = isRef ? 'reference' : 'upload';

  const downloadVideoUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${userId}/${fileId}/${filename}.mp4`,
    }),
    { expiresIn: 600 },
  );

  const downloadThumbnailUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${userId}/${fileId}/${filename}.jpg`,
    }),
    { expiresIn: 600 },
  );

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
        downloadVideoUrl: downloadVideoUrl,
        downloadThumbnailUrl: downloadThumbnailUrl,
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}