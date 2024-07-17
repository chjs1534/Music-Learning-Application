const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MessagingTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    const {
      eventBody,
      requestContext: { routeKey, connectionId, domainName, stage },
      queryStringParameters = {},
    } = event;
    const { userId } = queryStringParameters;
    const callbackUrl = `https://${domainName}/${stage}`;

    try {
        if (typeof eventBody != Object) {
            eventBody = JSON.parse(eventBody);
        }
        const { senderId, msg } = eventBody;

        const res = dynamo.scan({
            TableName: tableName,
        });
        if (res && res.Items && res.Items.length) {
            await Promise.all(
                res.Items.map(async (obj) => {
                    try {
                        const clientApi = new ApiGatewayManagementApiClient({
                            endpoint: callbackUrl,
                        });
                        const requestParams = {
                            ConnectionId: obj.Id.S,
                            Data: `{"sender_id":"${senderId}","msg":"${msg}"}`,
                        };
                        const command = new PostToConnectionCommand(requestParams);
                        await clientApi.send(command);
                    } catch (e) {
                        console.log(e);
                    }
                })
            );
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = {connectionId: connectionId, userId: userId};
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};