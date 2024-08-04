const aws = require('aws-sdk');
require('dotenv').config();
aws.config.update({region:'ap-southeast-2'})
const lambda = new aws.Lambda();

describe('upload lambda', () => {
  it ('missing parameters - userId', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Upload',
        Payload: JSON.stringify({ body: JSON.stringify({ fileId: 'test', isRef: false }) })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(400);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody).toEqual({error: "Missing required body parameters"});
  })

  it ('missing parameters - fileId', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Upload',
        Payload: JSON.stringify({ body: JSON.stringify({ userId: 'test', isRef: false }) })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(400);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody).toEqual({error: "Missing required body parameters"});
  })

  it ('successful upload', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Upload',
        Payload: JSON.stringify({ body: JSON.stringify({ userId: 'test', fileId: 'test', isRef: false }) })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(200);
  })
});

describe('download lambda', () => {
  it ('missing parameters - userId', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Download',
        Payload: JSON.stringify({ pathParameters: { fileId: 'test', isRef: false } })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(400);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody).toEqual({error: "Missing required query string parameters."});
  })

  it ('missing parameters - fileId', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Download',
        Payload: JSON.stringify({ pathParameters: { userId: 'test', isRef: false } })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(400);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody).toEqual({error: "Missing required query string parameters."});
  })

  it ('download with uploading', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Download',
        Payload: JSON.stringify({ pathParameters: { userId: 'test100', fileId: 'test200', isRef: false } })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(422);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody).toEqual({error: 'Object does not exist in S3.'});
  })

  it ('successful download after uploading', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Upload',
        Payload: JSON.stringify({ body: JSON.stringify({ userId: 'test', fileId: 'test', isRef: false }) })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(200);

    const downloadResponse = await lambda.invoke({
        FunctionName: 'Download',
        Payload: JSON.stringify({ pathParameters: { userId: 'test', fileId: 'test', isRef: false } })
    }).promise();
    const downloadResponseJSON = JSON.parse(downloadResponse.Payload);
    expect(downloadResponseJSON.statusCode).toBe(200);
  })
})

describe('list uploads lambda', () => {
  it ('missing parameters - userId', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Videos',
        Payload: JSON.stringify({ pathParameters: { } })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(400);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody).toEqual({error: "Missing required query string parameters."});
  })

  it ('list uploads success', async () => {
    const uploadResponse = await lambda.invoke({
        FunctionName: 'Upload',
        Payload: JSON.stringify({ body: JSON.stringify({ userId: 'test', fileId: 'test', isRef: false }) })
    }).promise();
    const uploadResponseJSON = JSON.parse(uploadResponse.Payload);
    expect(uploadResponseJSON.statusCode).toBe(200);

    // 1 upload
    const response = await lambda.invoke({
        FunctionName: 'Videos',
        Payload: JSON.stringify({ pathParameters: { userId: 'test' } })
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(200);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody.fileIds.length).toEqual(1);

    // upload again
    const uploadResponse1 = await lambda.invoke({
        FunctionName: 'Upload',
        Payload: JSON.stringify({ body: JSON.stringify({ userId: 'test', fileId: 'test', isRef: false }) })
    }).promise();
    const uploadResponseJSON1 = JSON.parse(uploadResponse1.Payload);
    expect(uploadResponseJSON1.statusCode).toBe(200);

    // 2 uploads
    const response1 = await lambda.invoke({
        FunctionName: 'Videos',
        Payload: JSON.stringify({ pathParameters: { userId: 'test' } })
    }).promise();
    const responseJSON1 = JSON.parse(response1.Payload);
    expect(responseJSON.statusCode).toBe(200);
    const responseJSONBody1 = JSON.parse(responseJSON1.body);
    expect(responseJSONBody1.fileIds.length).toEqual(2);
  })

})

describe('commenting lambdas', () => {
  it ('missing parameters', async () => {
    const response = await lambda.invoke({
        FunctionName: 'Comment',
        Payload: JSON.stringify({ body: JSON.stringify({ 
          userId: 'user',
          missingfileId: 'file',
          authorId: 'author',
          videoTime: '123',
          commentText: 'comment' 
        })}),
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(400);
    const responseJSONBody = JSON.parse(responseJSON.body);
    expect(responseJSONBody).toEqual({error: "Missing required query string parameters."});
  })

  it ('simple comment on a video', async () => {
    const uploadResponse = await lambda.invoke({
        FunctionName: 'Upload',
        Payload: JSON.stringify({ body: JSON.stringify({ userId: 'test', fileId: 'test', isRef: false }) })
    }).promise();
    const uploadResponseJSON = JSON.parse(uploadResponse.Payload);
    expect(uploadResponseJSON.statusCode).toBe(200);
    const uploadResponseJSONBody = JSON.parse(uploadResponseJSON.body);
    const fileId = uploadResponseJSONBody.fileId

    // make comment
    const response = await lambda.invoke({
        FunctionName: 'Comment',
        Payload: JSON.stringify({ body: JSON.stringify({ 
          userId: 'test',
          fileId: fileId,
          authorId: 'author',
          videoTime: '123',
          commentText: 'comment' 
        })}),
    }).promise();
    const responseJSON = JSON.parse(response.Payload);
    expect(responseJSON.statusCode).toBe(200);
    
    // view comment
    const getResponse = await lambda.invoke({
        FunctionName: 'Comments',
        Payload: JSON.stringify({ pathParameters: { userId: 'test' } }),
    }).promise();
    const getResponseJSON = JSON.parse(getResponse.Payload);
    expect(getResponseJSON.statusCode).toBe(200);
    const getResponseJSONBody = JSON.parse(getResponseJSON.body);
    expect(getResponseJSONBody.comments.length).toEqual(1);
    expect(getResponseJSONBody.comments[0].time).toEqual('123');
    expect(getResponseJSONBody.comments[0].text).toEqual('comment');
  })
})