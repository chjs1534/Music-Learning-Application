const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);
const s3Client = new S3Client({});

BUCKET_NAME = 'gently-weekly-tough-lion'

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const studentId = requestBody.studentId;
  const teacherId = requestBody.teacherId;
  const taskTitle = requestBody.taskTitle;
  const taskText = requestBody.taskText;
  const dueDate = requestBody.dueDate;
  const filename = requestBody.filename;

  const taskId = Math.random().toString(16).slice(2)

  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${studentId}/${taskId}/${filename}`,
    }),
    { expiresIn: 600 },
  );

  const response = docClient.send(new UpdateCommand({
    TableName: 'TasksTable',
    Key: {
      studentId: `${studentId}`,
      teacherId: `${teacherId}`,
    },
    UpdateExpression: 'SET tasks = list_append(if_not_exists(tasks, :empty_list), :new_task)',
    ExpressionAttributeValues: {
      ':empty_list': [],
      ':new_task': [{
        'id': taskId,
        'title': taskTitle,
        'text': taskText,
        'dueDate': dueDate,
        'filename': filename,
        'submitted': false,
        'submissionLink': '',
        'submissionText': '',
      }]
    },
  }));

  console.log(response)

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: uploadUrl,
      taskId: taskId,
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}