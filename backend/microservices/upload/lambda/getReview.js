const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { GetObjectCommand, S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

BUCKET_NAME = "truly-entirely-hip-raccoon"

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

const s3Client = new S3Client({});

exports.handler = async (event, context, callback) => {
  try {
    const userId = event.queryStringParameters.userId;
    const fileId = event.queryStringParameters.fileId;
 
    const response = await docClient.send(new GetCommand({
      TableName: 'VideosTable',
      Key: {
        userId: `${userId}`,
        fileId: `${fileId}`,
      },
    }));
    console.log(response);
    console.log(response.Item)
    console.log(response.Item.review)
    if (response.Item.review == ['empty']) {
      throw new Error('Review does not exist.');
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
    console.log(e)
    callback(null, {
      statusCode: 400,
      body: {
        res: e
      },
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  }
}