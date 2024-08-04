const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);
const s3Client = new S3Client({});

BUCKET_NAME = "truly-entirely-hip-raccoon"

/**
 * AWS Lambda handler to generate presigned URLs for uploading video and thumbnail to S3 and to record the upload details in DynamoDB.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event body:
 * @param {string} userId               The ID of the user uploading a video
 * @param {string} fileId               FileId required when isRef is true to attach reference to existing fileId.
 * @param {boolean} isRef               Marks if upload is an original upload or a reference video for an existing upload.
 * 
 * Response body:
 * @param {string} uploadVideoUrl      A AWS S3 presigned URL. Make a PUT request with the file data.
 * @param {string} uploadThumbnailUrl  A AWS S3 presigned URL. Make a PUT request with the file data.
 * @param {string} fileId              The fileId of the upload.
 */
exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const userId = requestBody.userId;
    const fileId = requestBody.fileId;
    const isRef = requestBody.isRef;
    
    if (!userId || !fileId) {
      throw new Error('Missing required body parameters');
    }

    // use timestamp as Id
    let time = Date.now();
    if (isRef) time = fileId;
  
    const filename = isRef ? 'reference' : 'upload';
  
    // get AWS S3 presigned url for permission to upload video
    const uploadVideoUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${userId}/${time}/${filename}.mp4`,
      }),
      { expiresIn: 600 },
    );
  
    // get AWS S3 presigned url for permission to upload thumnail
    const uploadThumbnailUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${userId}/${time}/${filename}.jpg`,
      }),
      { expiresIn: 600 },
    );
  
    // put in dynamo database 
    if (!isRef) {
      const response = docClient.send(new PutCommand({
        TableName: 'VideosTable',
        Item: {
          userId: `${userId}`,
          fileId: `${time}`,
          review: ['empty'],
        }
      }));
      if (!response) {
        throw new Error('Failed to put in database.')
      }
    }
  
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
          uploadVideoUrl: uploadVideoUrl,
          uploadThumbnailUrl: uploadThumbnailUrl,
          fileId: time,
      }),
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    let statusCode = 400;
    let message = e.message;

    if (message.includes('Missing required body parameters')) {
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