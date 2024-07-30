const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

BUCKET_NAME = 'gently-weekly-tough-lion'

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const studentId = requestBody.studentId;
  const teacherId = requestBody.teacherId;
  const taskId = requestBody.taskId;
  const submissionLink = requestBody.submissionLink;
  const submissionText = requestBody.submissionText;

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

  console.log(response)

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });

}