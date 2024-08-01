const aws = require('aws-sdk');
const registerAndLogin = require('../../helper')
const { CognitoUserPool } = require('amazon-cognito-identity-js');
require('dotenv').config();
aws.config.update({region:'ap-southeast-2'})
const cognito = new aws.CognitoIdentityServiceProvider();
const lambda = new aws.Lambda();

// TODO: not just check status codes
describe('Delete', () => {
	jest.setTimeout(15000);    
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Basic delete
	it('Test basic user delete', async () => {
        // Register and login user
        const email = 'test@example.com';
        const username = 'testStudent';
        const userType = 'Student';
        const firstName = 'first';
        const lastName = 'last';
        const password = 'password';
        const { cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password)

		// Sign out user
		cognitoUser.signOut();

		// Delete user
		const deleteResponse = await lambda.invoke({
            FunctionName: 'DeleteUser',
            Payload: JSON.stringify({ pathParameters: { userId: userId} })
		}).promise();
		const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
		expect(deleteResponseJSON.statusCode).toBe(200);

        // Check user not in user pool
		try {
			await cognito.adminGetUser({
				UserPoolId: poolData.UserPoolId,
				Username: username
			}).promise();
			throw new Error("User not deleted");
		} catch(err) {
			expect(err).toBeDefined();
			expect(err.message).toEqual('User does not exist.')
		}
		
		// Check user not in database
		const getResponse = await lambda.invoke({
			FunctionName: 'GetUser',
			Payload: JSON.stringify({ pathParameters: { userId: userId} })
		}).promise();
		const getResponseJSON = JSON.parse(getResponse.Payload);
		expect(getResponseJSON.statusCode).toBe(404);
    });

    // Delete parent and children
    it('Test parent user delete', async () => {
        // Register and login parent user
        const email = 'test@example.com';
        const username = 'testParent';
        const userType = 'Parent';
        const firstName = 'first';
        const lastName = 'last';
        const password = 'password';
        const { cognitoUser: cognitoUser, userId: userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password);

        // Register and login child user
        const email2 = 'test@example.com';
        const username2 = 'testChild';
        const userType2 = 'Child';
        const firstName2 = 'first2';
        const lastName2 = 'last2';
        const password2 = 'password2';
        const { cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2);
		
        // Sign out users
        await cognitoUser.signOut();
        await cognitoUser2.signOut();

		// Delete parent user
		const deleteResponse = await lambda.invoke({
            FunctionName: 'DeleteUser',
            Payload: JSON.stringify({ pathParameters: { userId: userId} })
		}).promise();
		const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
		expect(deleteResponseJSON.statusCode).toBe(200);

        // Parent
        // Check user not in user pool
		try {
			await cognito.adminGetUser({
				UserPoolId: poolData.UserPoolId,
				Username: username
			}).promise();
			throw new Error("User not deleted");
		} catch(err) {
			expect(err).toBeDefined();
			expect(err.message).toEqual('User does not exist.')
		}
		
		// Check user not in database
		const getResponse = await lambda.invoke({
			FunctionName: 'GetUser',
			Payload: JSON.stringify({ pathParameters: { userId: userId} })
		}).promise();
		const getResponseJSON = JSON.parse(getResponse.Payload);
		expect(getResponseJSON.statusCode).toBe(404);

        // Child
        // Check user not in user pool
		try {
			await cognito.adminGetUser({
				UserPoolId: poolData.UserPoolId,
				Username: username2
			}).promise();
			throw new Error("User not deleted");
		} catch(err) {
			expect(err).toBeDefined();
			expect(err.message).toEqual('User does not exist.')
		}
		
		// Check user not in database
		const getResponse2 = await lambda.invoke({
			FunctionName: 'GetUser',
			Payload: JSON.stringify({ pathParameters: { userId: userId2} })
		}).promise();
		const getResponseJSON2 = JSON.parse(getResponse2.Payload);
		expect(getResponseJSON2.statusCode).toBe(404);
    });

    // Delete matches (requests)
    it('Test match delete', async () => {
        // Register and login parent user
        const email = 'test@example.com';
        const username = 'testParent';
        const userType = 'Parent';
        const firstName = 'first';
        const lastName = 'last';
        const password = 'password';
        const { cognitoUser: cognitoUser, userId: userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password);

        // Register and login child user
        const email2 = 'test@example.com';
        const username2 = 'testChild';
        const userType2 = 'Child';
        const firstName2 = 'first2';
        const lastName2 = 'last2';
        const password2 = 'password2';
        const { cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2);

        // Register and login teacher user
        const email3 = 'test3@example.com';
        const username3 = 'testTeacher';
        const userType3 = 'Teacher';
        const firstName3 = 'first2';
        const lastName3 = 'last2';
        const password3 = 'password2';
        const { cognitoUser: cognitoUser3, userId: userId3 } = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3);
		
        // Match teacher and child
        const matchResponse = await lambda.invoke({
            FunctionName: 'AddRequest',
            Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId3 }) })
		}).promise();
		const matchResponseJSON = JSON.parse(matchResponse.Payload);
		expect(matchResponseJSON.statusCode).toBe(200);

        // Sign out users
        await cognitoUser.signOut();
        await cognitoUser2.signOut();
        await cognitoUser3.signOut();

		// Delete parent user
		const deleteResponse = await lambda.invoke({
            FunctionName: 'DeleteUser',
            Payload: JSON.stringify({ pathParameters: { userId: userId} })
		}).promise();
		const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
		expect(deleteResponseJSON.statusCode).toBe(200);

        // Parent
        // Check user not in user pool
		try {
			await cognito.adminGetUser({
				UserPoolId: poolData.UserPoolId,
				Username: username
			}).promise();
			throw new Error("User not deleted");
		} catch(err) {
			expect(err).toBeDefined();
			expect(err.message).toEqual('User does not exist.')
		}
		
		// Check user not in database
		const getResponse = await lambda.invoke({
			FunctionName: 'GetUser',
			Payload: JSON.stringify({ pathParameters: { userId: userId} })
		}).promise();
		const getResponseJSON = JSON.parse(getResponse.Payload);
		expect(getResponseJSON.statusCode).toBe(404);

        // Child
        // Check user not in user pool
		try {
			await cognito.adminGetUser({
				UserPoolId: poolData.UserPoolId,
				Username: username2
			}).promise();
			throw new Error("User not deleted");
		} catch(err) {
			expect(err).toBeDefined();
			expect(err.message).toEqual('User does not exist.')
		}
		
		// Check user not in database
		const getResponse2 = await lambda.invoke({
			FunctionName: 'GetUser',
			Payload: JSON.stringify({ pathParameters: { userId: userId2} })
		}).promise();
		const getResponseJSON2 = JSON.parse(getResponse2.Payload);
		expect(getResponseJSON2.statusCode).toBe(404);

        // Delete teacher user
		const deleteResponse3 = await lambda.invoke({
            FunctionName: 'DeleteUser',
            Payload: JSON.stringify({ pathParameters: { userId: userId3} })
		}).promise();
		const deleteResponseJSON3 = JSON.parse(deleteResponse3.Payload);
		expect(deleteResponseJSON3.statusCode).toBe(200);

        // Teacher
        // Check user not in user pool
		try {
			await cognito.adminGetUser({
				UserPoolId: poolData.UserPoolId,
				Username: username3
			}).promise();
			throw new Error("User not deleted");
		} catch(err) {
			expect(err).toBeDefined();
			expect(err.message).toEqual('User does not exist.')
		}
		
		// Check user not in database
		const getResponse3 = await lambda.invoke({
			FunctionName: 'GetUser',
			Payload: JSON.stringify({ pathParameters: { userId: userId3} })
		}).promise();
		const getResponseJSON3 = JSON.parse(getResponse3.Payload);
		expect(getResponseJSON3.statusCode).toBe(404);

        // Check matches not in database
        const matchResponse2 = await lambda.invoke({
            FunctionName: 'GetRequests',
            Payload: JSON.stringify({ pathParameters: { userId: userId3} })
		}).promise();
		const matchResponseJSON2 = JSON.parse(matchResponse2.Payload);
		expect(matchResponseJSON2.statusCode).toBe(200);
        const matchResponseJSON2Body = JSON.parse(matchResponseJSON2.body);
        expect(matchResponseJSON2Body.requests).toEqual([]);
    });
});