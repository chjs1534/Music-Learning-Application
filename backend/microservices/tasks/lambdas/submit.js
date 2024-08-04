const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

BUCKET_NAME = 'gently-weekly-tough-lion'

/**
 * AWS Lambda handler to allow a student to submit a task and provide a link to their upload and text.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event body:
 * @param {string} studentId        The ID of the student who owns the task.
 * @param {string} teacherId        The ID of the teacher who assigned the task.
 * @param {string} taskId           Task ID.
 * @param {string} submissionLink   The video link of the task submission.
 * @param {string} submissionText   Submission description.
 */
exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const studentId = requestBody.studentId;
    const teacherId = requestBody.teacherId;
    const taskId = requestBody.taskId;
    const submissionLink = requestBody.submissionLink;
    const submissionText = requestBody.submissionText;
    
    if (!studentId || !teacherId || !taskId || !submissionLink || !submissionText) {
      throw new Error('Missing required body parameters.')
    }

    const getResponse = await docClient.send(new GetCommand({
      TableName: 'TasksTable',
      Key: {
        studentId: `${studentId}`,
        teacherId: `${teacherId}`,
      },
    }));
  
    if (!getResponse.Item) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Task does not exist'
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
      };
    }
    
    // get index of item in list, required to update element using UpdateCommand
    const idx = getResponse.Item.tasks.map(e => e.id).indexOf(taskId);
  
    const response = await docClient.send(new UpdateCommand({
      TableName: 'TasksTable',
      Key: {
        studentId: `${studentId}`,
        teacherId: `${teacherId}`,
      },
      UpdateExpression: 'SET tasks[' + idx + '].submitted = :submitted, tasks[' + idx + '].submissionLink = :link, tasks[' + idx + '].submissionText = :text',
      ExpressionAttributeValues: {
        ':submitted': true,
        ':link': submissionLink,
        ':text': submissionText
      },
    }));
  
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
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