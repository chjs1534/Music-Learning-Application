const aws = require('aws-sdk');
const registerAndLogin = require('../../helper')
const { CognitoUserPool } = require('amazon-cognito-identity-js');
require('dotenv').config();
aws.config.update({region:'ap-southeast-2'})
const lambda = new aws.Lambda();

// Connect and disconnect lambda
describe('Connection', () => {
	jest.setTimeout(15000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Basic connection
	it('Test basic getRequests', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        try {
            // Register and login teacher
            const email = 'testTeacher@example.com';
            const username = 'testTeacher';
            const userType = 'Teacher';
            const firstName = 'testTeacher';
            const lastName = 'testTeacher';
            const password = 'testTeacher';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Register and login student
            const email2 = 'testStudent@example.com';
            const username2 = 'testStudent';
            const userType2 = 'Student';
            const firstName2 = 'testStudent';
            const lastName2 = 'testStudent';
            const password2 = 'testStudent';
            ({ cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2));

            // Add request
            const response = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);

            // Add match
            const response2 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            // Connect
            const response3 = await lambda.invoke({
                FunctionName: 'Connect',
                Payload: JSON.stringify({requestContext: { connectionId: "1" }})
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(200);

            // Disconnect
            const response4 = await lambda.invoke({
                FunctionName: 'Disconnect',
                Payload: JSON.stringify({requestContext: { connectionId: "1" }})
            }).promise();
            const responseJSON4 = JSON.parse(response4.Payload);
            expect(responseJSON4.statusCode).toBe(200);

            
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();
            if (cognitoUser2) await cognitoUser2.signOut();

            // Delete user
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
            if (userId2) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId2} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
        }
    });
});