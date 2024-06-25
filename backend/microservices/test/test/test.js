const AWS = require ("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {    
    const requestBody = JSON.parse(event.body);
    const testId = requestBody.testId;

    console.log('Received event (', testId, '): ', event);

    recordRide(testId).then(() => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                testId: testId
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function recordRide(testId) {
    return ddb.put({
        TableName: 'testTable',
        Item: {
            testId: testId
        },
    }).promise();
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}