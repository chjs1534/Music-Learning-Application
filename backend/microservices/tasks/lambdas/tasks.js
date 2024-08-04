const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

/**
 * AWS Lambda handler to get tasks information related to a student.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event body:
 * @param {string} studentId        The ID of the student.
 * @param {string} teacherId        The ID of the teacher who assigned tasks to the student.
 * 
 * Response body:
 * @param {list} tasks              A list of tasks objects.
 */
exports.handler = async (event, context, callback) => {
  const studentId = event.queryStringParameters.studentId;
  const teacherId = event.queryStringParameters?.teacherId;

  let tasks = [];

  if (teacherId) {
    const response = await docClient.send(new GetCommand({
      TableName: 'TasksTable',
      Key: {
        studentId: `${studentId}`,
        teacherId: `${teacherId}`,
      },
    }));

    if (response.Item) tasks = response.Item.tasks

  } else {
    const response = await docClient.send(new QueryCommand({
      TableName: 'TasksTable',
      ExpressionAttributeValues: {
        ':id': studentId
      },
      KeyConditionExpression: 'studentId = :id',
      ProjectionExpression: "teacherId, tasks",
    }));

    if (response.Items) tasks = response.Items
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      tasks: tasks
    }),
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
  });
}