const AWS = require ("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {    
    const requestBody = JSON.parse(event.body);
    const userId = requestBody.UserId;

    console.log('Received event (', userId, '): ', event);

    recordRide(userId).then(() => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                UserId: userId
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

function recordRide(userId) {
    return ddb.put({
        TableName: 'Mewsic_User_Table',
        Item: {
            userId: userId
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