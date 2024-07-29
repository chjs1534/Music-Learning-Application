const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);
const s3Client = new S3Client({});

BUCKET_NAME = "truly-entirely-hip-raccoon"

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const userId = requestBody.userId;
    const fileId = requestBody.fileId;
    const isRef = requestBody.isRef;
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
      docClient.send(new PutCommand({
        TableName: 'VideosTable',
        Item: {
          userId: `${userId}`,
          fileId: `${time}`,
          review: "Review does not exist.",
          comments: []
        }
      }));
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
    console.log(e)
    callback(null, {
      statusCode: 203,
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  }
}