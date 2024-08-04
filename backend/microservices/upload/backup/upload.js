const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);
const s3Client = new S3Client({});

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const userId = requestBody.userId;
  const time = Date.now();

  // get AWS S3 presigned url for permission to upload
  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: "truly-entirely-hip-raccoon",
      Key: `${userId}/${time}.mp4`,
    }),
    { expiresIn: 600 },
  );

  // put in dynamo database 
  docClient.send(new PutCommand({
    TableName: 'Reviews',
    Item: {
      UserId: userId,
      Filename: `${time}.mp4`,
      Review: "Review does not exist."
    }
  }));

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
        uploadURL: uploadUrl,
        filename: `${time}.mp4`,
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}