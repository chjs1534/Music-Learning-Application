const { GetObjectCommand, S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
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

  const videoParams = {
    Bucket: BUCKET_NAME,
    Key: `${userId}/${fileId}/${filename}.mp4`,
  };
  const thumbnailParams = {
    Bucket: BUCKET_NAME,
    Key: `${userId}/${fileId}/${filename}.jpg`,
  };

  // check if objects exist
  try {
    await s3Client.send(new HeadObjectCommand(videoParams));
    await s3Client.send(new HeadObjectCommand(thumbnailParams));  
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

  const downloadVideoUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand(videoParams),
    { expiresIn: 600 },
  );

  const downloadThumbnailUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand(thumbnailParams),
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