// To delete users manually 
const aws = require('aws-sdk');
const { CognitoUserPool } = require('amazon-cognito-identity-js');
require('dotenv').config();

aws.config.update({region:'ap-southeast-2'});
const lambda = new aws.Lambda();

describe('Auth', () => {
	jest.setTimeout(15000);
	let poolData;
	let userPool;

    beforeAll(() => {
        poolData = {
            UserPoolId: process.env.USERPOOL_ID,
            ClientId: process.env.CLIENT_ID
        }
        userPool = new CognitoUserPool(poolData);
    });

    it('delete', async () => {
        // Clean up by deleting user
        const payload = JSON.stringify({ pathParameters: { userId: '99beb408-90f1-70a1-ed15-c57bb9032c7b' } });
        const deleteParams = {
                FunctionName: 'DeleteUser',
                Payload: payload
        };
        const deleteResponse = await lambda.invoke(deleteParams).promise();
        const result4 = JSON.parse(deleteResponse.Payload);
        console.log(result4);
        expect(result4.statusCode).toBe(200);
    });
});


