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
        const payload = JSON.stringify({ pathParameters: { userId: '499e8478-2051-7077-4e6e-6571768d55c7' } });
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


