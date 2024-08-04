const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb");

const DDBclient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(DDBclient);

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