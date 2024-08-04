const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);
const s3Client = new S3Client({});

BUCKET_NAME = 'gently-weekly-tough-lion'

/**
 * AWS Lambda handler to put a task assigned from teacher to student in dynamoDB. A file can optionally be attached.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event body:
 * @param {string} studentId       The ID of the student being assigned a task.
 * @param {string} teacherId       The ID of the teacher assigning a task.
 * @param {string} taskTitle       Task title.
 * @param {string} taskText        Task description.
 * @param {string} dueDate         Due date of task.
 * @param {string} filename        Filename of attached file.
 * 
 * REsponse body:
 * @param {string} uploadUrl       A S3 presigned URL. Make a PUT request to upload the file data.
 * @param {string} taskId          The generated ID of the task.
 */
exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const studentId = requestBody.studentId;
    const teacherId = requestBody.teacherId;
    const taskTitle = requestBody.taskTitle;
    const taskText = requestBody.taskText;
    const dueDate = requestBody.dueDate;
    const filename = requestBody.filename;
  
    if (!studentId || !teacherId || !taskTitle || ! taskText || !dueDate || !filename) {
      throw new Error('Missing required body parameters.')
    }

    // generate ID
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
  
    if (!response) {
      throw new Error('Failed to update database.');
    }

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