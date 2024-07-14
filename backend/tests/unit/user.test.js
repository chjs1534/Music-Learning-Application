const { handler } = require('../../microservices/user/lambdas/getUser');
const aws = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mDocumentClient = { get: jest.fn() };
  const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) };
  return { DynamoDB: mDynamoDB };
});

const mDynamoDb = new aws.DynamoDB.DocumentClient();

describe('getUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get user from DynamoDB table', async () => {
    const mResult = { Item: { userId: '1' } };
    mDynamoDb.get.mockImplementationOnce(() => ({
      promise: jest.fn().mockResolvedValue(mResult),
    }));

    const event = {
      body: JSON.stringify({ userId: '1' }),
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify({ userId: '1' }));
    expect(mDynamoDb.get).toHaveBeenCalledWith({
      TableName: 'UserTable',
      Key: {
        userId: '1',
      },
    });
  });
});
