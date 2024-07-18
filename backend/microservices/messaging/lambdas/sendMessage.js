const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MessagingTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    const connectionId = event.requestContext.connectionId;
    const domainName = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    const callbackUrl = `https://${domainName}/${stage}`;
    let eventBody = event.body;
    if (typeof eventBody != Object) {
        eventBody = JSON.parse(eventBody);
    }
    const userId = eventBody.userId;
    const msg = eventBody.msg;
    
    try {
        const res = await dynamo.scan({
            TableName: tableName,
        }).promise();
        if (res && res.Items && res.Items.length) {
            await Promise.all(
                res.Items.map(async (obj) => {
                    try {
                        const clientApi = new aws.ApiGatewayManagementApi({
                            endpoint: callbackUrl,
                        });
                        const requestParams = {
                            ConnectionId: obj.connectionId,
                            Data: `{"userId":"${userId}","msg":"${msg}"}`,
                        };
                        await clientApi.postToConnection(requestParams).promise()
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