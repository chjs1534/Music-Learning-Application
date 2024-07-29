const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({});
BUCKET_NAME = "truly-entirely-hip-raccoon";

exports.handler = async (event, context, callback) => {
  try {
    const userId = event.queryStringParameters.userId;

    const command = new ListObjectsV2Command({
      'Bucket': BUCKET_NAME,
      'Prefix': `${userId}/`
    });
    const response = await s3Client.send(command);

    const fileIds = [];

    if (response.Contents) {
      for (const obj of response.Contents) {
        console.log(obj);
        fileIds.push(obj.Key.split('/')[1]);
      }
    }
    console.log(fileIds)

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        fileIds: [...new Set(fileIds)] // remove duplicates
      }),
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.log(e)
  }
}