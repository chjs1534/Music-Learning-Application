const aws = require('aws-sdk');
const registerAndLogin = require('../../helper')
const { CognitoUserPool } = require('amazon-cognito-identity-js');
require('dotenv').config();
aws.config.update({region:'ap-southeast-2'})
const lambda = new aws.Lambda();

// getRequests lambda
describe('GetRequests', () => {
	jest.setTimeout(15000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Errors
    it ('Test errors', async() => {
        try {
            // Wrong user id type
            const getResponse = await lambda.invoke({
                FunctionName: 'GetRequests',
                Payload: JSON.stringify({ pathParameters: { userId: 3 } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(400);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual({error: "Invalid userId"});
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
        }
    });

    // Basic getRequests
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

            // Get requests
            const getResponse = await lambda.invoke({
                FunctionName: 'GetRequests',
                Payload: JSON.stringify({ pathParameters: { userId: userId } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    requests: [{
                        userId: userId2
                    }]
                }
            )
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

// addRequest lambda
describe('AddRequest', () => {
	jest.setTimeout(15000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Errors
    it ('Test errors', async() => {
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

            // Wrong user id type
            const response = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: 3, userId2: 2 }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(400);
            const responseJSONBody = JSON.parse(responseJSON.body);
            expect(responseJSONBody).toEqual({error: "Invalid userId"});

            // Request twice
            const response2 = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            const response3 = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(409);
            const responseJSONBody3 = JSON.parse(responseJSON3.body);
            expect(responseJSONBody3).toEqual({error: "Request already exists"});
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

    // Basic addRequest
	it('Test basic addRequest', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        try {
            // Register and login parent
            const email = 'testParent@example.com';
            const username = 'testParent';
            const userType = 'Parent';
            const firstName = 'testParent';
            const lastName = 'testParent';
            const password = 'testParent';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Register and login teacher
            const email2 = 'testTeacher@example.com';
            const username2 = 'testTeacher';
            const userType2 = 'Teacher';
            const firstName2 = 'testTeacher';
            const lastName2 = 'testTeacher';
            const password2 = 'testTeacher';
            ({ cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2));

            // Register and login child
            const email3 = 'testParent@example.com';
            const username3 = 'testChild';
            const userType3 = 'Child';
            const firstName3 = 'testChild';
            const lastName3 = 'testChild';
            const password3 = 'testChild';
            ({ cognitoUser: cognitoUser3, userId: userId3 } = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3));

            // Add request
            const response = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId3, userId2: userId }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);

            // Get requests
            const getResponse = await lambda.invoke({
                FunctionName: 'GetRequests',
                Payload: JSON.stringify({ pathParameters: { userId: userId } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    requests: [{
                        userId: userId3
                    }]
                }
            )
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

// getMatches lambda
describe('GetMatches', () => {
	jest.setTimeout(15000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Errors
    it ('Test errors', async() => {
        try {
            // Wrong user id type
            const getResponse = await lambda.invoke({
                FunctionName: 'GetMatches',
                Payload: JSON.stringify({ pathParameters: { userId: 3 } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(400);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual({error: "Invalid userId"});
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
        }
    });

    // Basic getRequests
	it('Test basic getMatches', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        let cognitoUser3, userId3;
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

            // Register and login student2
            const email3 = 'testStudent2@example.com';
            const username3 = 'testStudent2';
            const userType3 = 'Student';
            const firstName3 = 'testStudent2';
            const lastName3 = 'testStudent2';
            const password3 = 'testStudent2';
            ({ cognitoUser: cognitoUser3, userId: userId3 } = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3));

            // Add requests
            const response = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);
            const response2 = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId3, userId2: userId }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            // Add match only for first student
            const response3 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(200);

            // Get matches
            const getResponse = await lambda.invoke({
                FunctionName: 'GetMatches',
                Payload: JSON.stringify({ pathParameters: { userId: userId } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    matches: [{
                        userId: userId2
                    }]
                }
            )
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();
            if (cognitoUser2) await cognitoUser2.signOut();
            if (cognitoUser3) await cognitoUser3.signOut();

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
            if (userId3) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId3} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
        }
    });
});

// addMatch lambda
describe('AddMatch', () => {
	jest.setTimeout(15000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Errors
    it ('Test errors', async() => {
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

            // Wrong user id type
            const response = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: 3, userId2: 2 }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(400);
            const responseJSONBody = JSON.parse(responseJSON.body);
            expect(responseJSONBody).toEqual({error: "Invalid userId"});

            // Match twice
            const response2 = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            const response3 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(200);

            const response4 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON4 = JSON.parse(response4.Payload);
            expect(responseJSON4.statusCode).toBe(409);
            const responseJSONBody4 = JSON.parse(responseJSON4.body);
            expect(responseJSONBody4).toEqual({error: "Match already exists"});
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

    // Basic addMatch
	it('Test basic addMatch', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        try {
            // Register and login parent
            const email = 'testParent@example.com';
            const username = 'testParent';
            const userType = 'Parent';
            const firstName = 'testParent';
            const lastName = 'testParent';
            const password = 'testParent';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Register and login student
            const email2 = 'testTeacher@example.com';
            const username2 = 'testTeacher';
            const userType2 = 'Teacher';
            const firstName2 = 'testTeacher';
            const lastName2 = 'testTeacher';
            const password2 = 'testTeacher';
            ({ cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2));

            // Register and login child
            const email3 = 'testParent@example.com';
            const username3 = 'testChild';
            const userType3 = 'Child';
            const firstName3 = 'testChild';
            const lastName3 = 'testChild';
            const password3 = 'testChild';
            ({ cognitoUser: cognitoUser3, userId: userId3 } = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3));

            // Add request
            const response = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId3, userId2: userId }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);

            // Add match
            const response2 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId3, userId2: userId }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            // Get matches
            const getResponse = await lambda.invoke({
                FunctionName: 'GetMatches',
                Payload: JSON.stringify({ pathParameters: { userId: userId } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    matches: [{
                        userId: userId3
                    }]
                }
            )
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

// removeMatch lambda
describe('RemoveMatch', () => {
	jest.setTimeout(15000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Errors
    it ('Test errors', async() => {
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

            // Wrong user id type
            const response = await lambda.invoke({
                FunctionName: 'RemoveMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: 3, userId2: 2 }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(400);
            const responseJSONBody = JSON.parse(responseJSON.body);
            expect(responseJSONBody).toEqual({error: "Invalid userId"});
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

    // Basic removeMatch
	it('Test basic removeMatch', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        try {
            // Register and login parent
            const email = 'testParent@example.com';
            const username = 'testParent';
            const userType = 'Parent';
            const firstName = 'testParent';
            const lastName = 'testParent';
            const password = 'testParent';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Register and login student
            const email2 = 'testTeacher@example.com';
            const username2 = 'testTeacher';
            const userType2 = 'Teacher';
            const firstName2 = 'testTeacher';
            const lastName2 = 'testTeacher';
            const password2 = 'testTeacher';
            ({ cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2));

            // Register and login child
            const email3 = 'testParent@example.com';
            const username3 = 'testChild';
            const userType3 = 'Child';
            const firstName3 = 'testChild';
            const lastName3 = 'testChild';
            const password3 = 'testChild';
            ({ cognitoUser: cognitoUser3, userId: userId3 } = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3));

            // Add request
            const response = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId3, userId2: userId }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);

            // Add match
            const response2 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId3, userId2: userId }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            // Remove match
            const response3 = await lambda.invoke({
                FunctionName: 'RemoveMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId3, userId2: userId }) })
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(200);

            // Get matches
            const getResponse = await lambda.invoke({
                FunctionName: 'GetMatches',
                Payload: JSON.stringify({ pathParameters: { userId: userId } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    matches: []
                }
            )
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();
            if (cognitoUser2) await cognitoUser2.signOut();
            if (cognitoUser3) await cognitoUser3.signOut();

            // Delete user
            if (userId3) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId3} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
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


// getMatchesForMessaging lambda
describe('GetMatchesForMessaging', () => {
	jest.setTimeout(30000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData); 

    // Basic getMatchesForMessaging
	it('Test basic getMatchesForMessaging', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        let cognitoUser3, userId3;
        let cognitoUser4, userId4;
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

            // Register and login parent
            const email3 = 'testParent@example.com';
            const username3 = 'testParent';
            const userType3 = 'Parent';
            const firstName3 = 'testParent';
            const lastName3 = 'testParent';
            const password3 = 'testParent';
            ({ cognitoUser: cognitoUser3, userId: userId3 } = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3));

            // Register and login child
            const email4 = 'testParent@example.com';
            const username4 = 'testChild';
            const userType4 = 'Child';
            const firstName4 = 'testChild';
            const lastName4 = 'testChild';
            const password4 = 'testChild';
            ({ cognitoUser: cognitoUser4, userId: userId4 } = await registerAndLogin(userPool, email4, username4, userType4, firstName4, lastName4, password4));

            // Add request student to teacher
            const response = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);

            // Add match student and teacher
            const response2 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId2, userId2: userId }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            // Add request child to teacher
            const response3 = await lambda.invoke({
                FunctionName: 'AddRequest',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId4, userId2: userId }) })
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(200);

            // Add match child and teacher
            const response4 = await lambda.invoke({
                FunctionName: 'AddMatch',
                Payload: JSON.stringify({ body: JSON.stringify({ userId1: userId4, userId2: userId }) })
            }).promise();
            const responseJSON4 = JSON.parse(response4.Payload);
            expect(responseJSON4.statusCode).toBe(200);
            
            // Get for teacher
            const getResponse = await lambda.invoke({
                FunctionName: 'GetMatchesForMessaging',
                Payload: JSON.stringify({ pathParameters: { userId: userId } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    matches: expect.arrayContaining([
                        {
                            userId: userId3
                        },
                        {
                            userId: userId2
                        }
                    ])
                }
            );
            

            // Get for student
            const getResponse2 = await lambda.invoke({
                FunctionName: 'GetMatchesForMessaging',
                Payload: JSON.stringify({ pathParameters: { userId: userId2 } })
            }).promise();
            const getResponseJSON2 = JSON.parse(getResponse2.Payload);
            expect(getResponseJSON2.statusCode).toBe(200);
            const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
            expect(getResponseJSONBody2).toEqual(
                {
                    matches: [
                        {
                            userId: userId
                        }
                    ]
                }
            )

            // Get for parent
            const getResponse3 = await lambda.invoke({
                FunctionName: 'GetMatchesForMessaging',
                Payload: JSON.stringify({ pathParameters: { userId: userId3 } })
            }).promise();
            const getResponseJSON3 = JSON.parse(getResponse3.Payload);
            expect(getResponseJSON3.statusCode).toBe(200);
            const getResponseJSONBody3 = JSON.parse(getResponseJSON3.body);
            expect(getResponseJSONBody3).toEqual(
                {
                    matches: [
                        {
                            userId: userId
                        }
                    ]
                }
            )
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();
            if (cognitoUser2) await cognitoUser2.signOut();
            if (cognitoUser3) await cognitoUser3.signOut();
            if (cognitoUser4) await cognitoUser4.signOut();

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
            if (userId4) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId4} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
            if (userId3) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId3} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
        }
    });
});
