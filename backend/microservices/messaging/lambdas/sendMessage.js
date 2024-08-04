/**
 * AWS Lambda function to handle sending a message via WebSocket and storing it in DynamoDB.
 * 
 * - Receives a message from a WebSocket client and stores it in the `MessagesTable`.
 * - Broadcasts the message to all connected clients by sending a message to each connection ID stored in the `MessagingTable`.
 * 
 * @param {Object} event - The event object containing WebSocket request details and the message.
 * @param {Object} event.requestContext - The context of the WebSocket request.
 * @param {string} event.requestContext.connectionId - The WebSocket connection ID of the sender.
 * @param {string} event.requestContext.domainName - The domain name of the API Gateway.
 * @param {string} event.requestContext.stage - The stage of the API Gateway.
 * @param {string} event.body - The JSON-encoded body of the WebSocket message.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body containing connectionId, senderId, and receiverId.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if there is an issue with scanning the `MessagingTable`, updating the `MessagesTable`, or sending messages to WebSocket connections.
*/


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