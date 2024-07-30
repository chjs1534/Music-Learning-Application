const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "MessagingTable";
const tableName2 = "MessagesTable";

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
    let eventBody = JSON.parse(event.body);
    const senderId = eventBody.senderId;
    const receiverId = eventBody.receiverId;
    const msg = eventBody.msg;
    
    try {
        const res = await dynamo.scan({
            TableName: tableName,
        }).promise();
        if (res && res.Items && res.Items.length) {
            const userId1 = senderId >= receiverId ? senderId : receiverId;
            const userId2 = senderId >= receiverId ? receiverId : senderId;
            await dynamo.update(
                {
                    TableName: tableName2,
                    Key: {
                        userId1: userId1,
                        userId2: userId2
                    },
                    UpdateExpression: 'SET messages = list_append(if_not_exists(messages, :empty_list), :new_message)',
                    ExpressionAttributeValues: {
                    ':empty_list': [],
                    ':new_message': [
                        { 'senderId': senderId, 'receiverId': receiverId, 'msg': msg, 'time':new Date().toISOString() }
                    ]
                    }
                }
            ).promise();

            await Promise.all(
                res.Items.map(async (obj) => {
                    try {
                        const clientApi = new aws.ApiGatewayManagementApi({
                            endpoint: callbackUrl,
                        });
                        const requestParams = {
                            ConnectionId: obj.connectionId,
                            Data: `{"senderId":"${senderId}", "receiverId":"${receiverId}", "msg":"${msg}"}`,
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
        body = {connectionId: connectionId, senderId: senderId, receiverId: receiverId};
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};