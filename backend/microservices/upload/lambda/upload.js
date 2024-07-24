const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);
const s3Client = new S3Client({});

BUCKET_NAME = "truly-entirely-hip-raccoon"

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const userId = requestBody.userId;
  const fileId = requestBody.fileId;
  const isRef = requestBody.isRef;
  const time = Date.now();
  if (isRef) time = fileId;

  const filename = isRef ? 'reference.mp4' : 'upload.mp4';

  // get AWS S3 presigned url for permission to upload
  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${userId}/${time}/${filename}`,
    }),
    { expiresIn: 600 },
  );

  // put in dynamo database 
  docClient.send(new PutCommand({
    TableName: 'Reviews',
    Item: {
      UserId: userId,
      FileId: time,
      Review: "Review does not exist."
    }
  }));

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
        uploadURL: uploadUrl,
        fileId: time,
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}