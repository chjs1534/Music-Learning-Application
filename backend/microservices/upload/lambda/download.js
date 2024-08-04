const { GetObjectCommand, S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

BUCKET_NAME = "truly-entirely-hip-raccoon"

const s3Client = new S3Client({});

/**
 * AWS Lambda handler to generate presigned URLs for downloading video and thumbnail from S3.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event parameters:
 * @param {string} userId               The ID of the user who uploaded the requested video.
 * @param {string} fileId               The ID of the file being downloaded.
 * @param {boolean} isRef               If the video is a reference video attached to another upload.
 * 
 * Response body:
 * @param {string} downloadVideoUrl      A AWS S3 presigned URL. Make a GET request to download file.
 * @param {string} downloadThumbnailUrl  A AWS S3 presigned URL. Make a GET request to download file.
 */
exports.handler = async (event, context, callback) => {
  try {
    const userId = event.queryStringParameters.userId;
    const fileId = event.queryStringParameters.fileId;
    const isRef = event.queryStringParameters?.isRef === '';
    const filename = isRef ? 'reference' : 'upload';

    if (!userId || !fileId) {
      throw new Error('Missing required query string parameters.');
    }

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
  } catch (e) {
    let statusCode = 400;
    let message = e.message;

    if (message.includes('Missing query string parameters.')) {
      statusCode = 400;
    } else if (message.includes('Object does not exist in S3.')) {
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