const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { GetObjectCommand, S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

BUCKET_NAME = "truly-entirely-hip-raccoon"

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

const s3Client = new S3Client({});

/**
 * AWS Lambda handler to get the audio comparison review of an uploaded video.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event parameters:
 * @param {string} userId             The ID of the user whose uploaded the video.
 * @param {string} fileId             The ID of the video.
 * 
 * Response body:
 * @param {list} chords               A list of chord objects that contain timestamps and chords from the videos.
 * @param {string} downloadTempoUrl   A S3 presigned URL. Use a GET request to download plot.
 * @param {string} downloadSyncUrl    A S3 presigned URL. Use a GET request to download plot.
 */
exports.handler = async (event, context, callback) => {
  try {
    const userId = event.queryStringParameters.userId;
    const fileId = event.queryStringParameters.fileId;
    
    if (!userId || !fileId) {
      throw new Error('Missing query string parameters.');
    }

    const response = await docClient.send(new GetCommand({
      TableName: 'VideosTable',
      Key: {
        userId: `${userId}`,
        fileId: `${fileId}`,
      },
    }));

    if (!response.Item || response.Item.review == ['empty']) {
      throw new Error('Review does not exist in database.');
    }

    const tempoParams = {
      Bucket: BUCKET_NAME,
      Key: `${userId}/${fileId}/tempo.png`,
    };
    const syncParams = {
      Bucket: BUCKET_NAME,
      Key: `${userId}/${fileId}/sync.png`,
    };

    // check if objects exist
    try {
      await s3Client.send(new HeadObjectCommand(tempoParams));
      await s3Client.send(new HeadObjectCommand(syncParams));  
    } catch (e) {
      if (e.name === 'NotFound') {
        throw new Error('Review does not exist in S3.');
      }
    }

    const downloadTempoUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(tempoParams),
      { expiresIn: 600 },
    );
  
    const downloadSyncUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(syncParams),
      { expiresIn: 600 },
    );

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        chords: response.Item.review,
        downloadTempoUrl: downloadTempoUrl,
        downloadSyncUrl: downloadSyncUrl,
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
    } else if (message.includes('Review does not exist')) {
      statusCode = 422;
    } else {
      statusCode = 500;
      message = 'Internal Server Error';
    }
    
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify({
        error: message,
      }),
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  }
}