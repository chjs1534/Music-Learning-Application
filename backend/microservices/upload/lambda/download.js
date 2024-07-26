const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

BUCKET_NAME = "truly-entirely-hip-raccoon"

const s3Client = new S3Client({});

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const userId = requestBody.userId;
  const fileId = requestBody.fileId;
  const isRef = requestBody.isRef

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
      Key: `${userId}/${fileId}/${filename}.png`,
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