const aws = require('aws-sdk');
const registerAndLogin = require('../../helper')
const { CognitoUserPool } = require('amazon-cognito-identity-js');
require('dotenv').config();
aws.config.update({region:'ap-southeast-2'})
const lambda = new aws.Lambda();

// getUser lambda
describe('GetUser', () => {
	jest.setTimeout(10000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Invalid userId
    it ('Test invalid userId', async() => {
        let cognitoUser, userId;
        try {
            // Register and login user
            const email = 'testStudent@example.com';
            const username = 'testStudent';
            const userType = 'Student';
            const firstName = 'testStudent';
            const lastName = 'testStudent';
            const password = 'testStudent';
            ({ cognitoUser: cognitoUser, userId: userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Wrong user id type
            const getResponse = await lambda.invoke({
                FunctionName: 'GetUser',
                Payload: JSON.stringify({ pathParameters: { userId: 3 } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(400);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual({error: "Invalid userId"});

            // Non-existent user id
            const getResponse2 = await lambda.invoke({
                FunctionName: 'GetUser',
                Payload: JSON.stringify({ pathParameters: { userId: "invalid" } })
            }).promise();
            const getResponseJSON2 = JSON.parse(getResponse2.Payload);
            expect(getResponseJSON2.statusCode).toBe(404);
            const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
            expect(getResponseJSONBody2).toEqual({error: "User not found"});
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();

            // Delete user
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
        }
    });

    // Basic getUser
	it('Test basic getUser', async () => {
        let cognitoUser, userId;
        try {
            // Register and login user
            const email = 'testStudent@example.com';
            const username = 'testStudent';
            const userType = 'Student';
            const firstName = 'testStudent';
            const lastName = 'testStudent';
            const password = 'testStudent';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Check user in database
            const getResponse = await lambda.invoke({
                FunctionName: 'GetUser',
                Payload: JSON.stringify({ pathParameters: { userId: userId} })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    userId: userId,
                    email: email,
                    username: username,
                    userType: userType,
                    firstName: firstName,
                    lastName: lastName,
                    aboutMe: "",
                    teacherReviews: []
                }
            )
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();

            // Delete user
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
    
                // Check user not in database
                const getResponse2 = await lambda.invoke({
                    FunctionName: 'GetUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const getResponseJSON2 = JSON.parse(getResponse2.Payload);
                expect(getResponseJSON2.statusCode).toBe(404);
                const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
                expect(getResponseJSONBody2).toEqual({error: "User not found"});
            }
        }
    });
});

// getFamily lambda
describe('GetFamily', () => {
	jest.setTimeout(10000);   
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Invalid userId
    it ('Test invalid userId', async() => {
        let cognitoUser, userId;
        
        try {
            // Register and login user
            const email = 'testStudent@example.com';
            const username = 'testStudent';
            const userType = 'Student';
            const firstName = 'testStudent';
            const lastName = 'testStudent';
            const password = 'testStudent';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Wrong user id type
            const getResponse = await lambda.invoke({
                FunctionName: 'GetFamily',
                Payload: JSON.stringify({ pathParameters: { userId: 3 } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(400);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual({error: "Invalid userId"});

            // Non-existent user id
            const getResponse2 = await lambda.invoke({
                FunctionName: 'GetFamily',
                Payload: JSON.stringify({ pathParameters: { userId: "invalid" } })
            }).promise();
            const getResponseJSON2 = JSON.parse(getResponse2.Payload);
            expect(getResponseJSON2.statusCode).toBe(404);
            const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
            expect(getResponseJSONBody2).toEqual({error: "User not found"});

            // Wrong user type
            const getResponse3 = await lambda.invoke({
                FunctionName: 'GetFamily',
                Payload: JSON.stringify({ pathParameters: { userId: userId } })
            }).promise();
            const getResponseJSON3 = JSON.parse(getResponse3.Payload);
            expect(getResponseJSON3.statusCode).toBe(400);
            const getResponseJSONBody3 = JSON.parse(getResponseJSON3.body);
            expect(getResponseJSONBody3).toEqual({error: "Invalid userType"});
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();

            // Delete user
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
        }
    });

    // Basic getFamily
	it('Test basic getFamily', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        let cognitoUser3, userId3;

        try {
            // Register and login random student user
            const email = 'testStudent@example.com';
            const username = 'testStudent';
            const userType = 'Student';
            const firstName = 'testStudent';
            const lastName = 'testStudent';
            const password = 'testStudent';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Register and login parent user
            const email2 = 'testParent@example.com';
            const username2 = 'testParent';
            const userType2 = 'Parent';
            const firstName2 = 'testParent';
            const lastName2 = 'testParent';
            const password2 = 'testParent';
            ({ cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2));

            // Parent without child should return empty list
            const getResponse0 = await lambda.invoke({
                FunctionName: 'GetFamily',
                Payload: JSON.stringify({ pathParameters: { userId: userId2} })
            }).promise();
            const getResponseJSON0 = JSON.parse(getResponse0.Payload);
            expect(getResponseJSON0.statusCode).toBe(200);
            const getResponseJSONBody0 = JSON.parse(getResponseJSON0.body);
            expect(getResponseJSONBody0).toEqual(
                {
                    users: []
                }
            )

            // Register and login child user
            const email3 = 'testParent@example.com';
            const username3 = 'testChild';
            const userType3 = 'Child';
            const firstName3 = 'testChild';
            const lastName3 = 'testChild';
            const password3 = 'testChild';
            ({ cognitoUser: cognitoUser3, userId: userId3} = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3));

            // Parent should return child
            const getResponse = await lambda.invoke({
                FunctionName: 'GetFamily',
                Payload: JSON.stringify({ pathParameters: { userId: userId2} })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    users: [{
                        userId: userId3,
                        email: email3,
                        username: username3,
                        userType: userType3,
                        firstName: firstName3,
                        lastName: lastName3,
                        aboutMe: "",
                        teacherReviews: []
                    }]
                }
            )

            // Child should return parent
            const getResponse2 = await lambda.invoke({
                FunctionName: 'GetFamily',
                Payload: JSON.stringify({ pathParameters: { userId: userId3} })
            }).promise();
            const getResponseJSON2 = JSON.parse(getResponse2.Payload);
            expect(getResponseJSON2.statusCode).toBe(200);
            const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
            expect(getResponseJSONBody2).toEqual(
                {
                    users: [{
                        userId: userId2,
                        email: email2,
                        username: username2,
                        userType: userType2,
                        firstName: firstName2,
                        lastName: lastName2,
                        aboutMe: "",
                        teacherReviews: []
                    }]
                }
            )
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out users
            if (cognitoUser) await cognitoUser.signOut();
            if (cognitoUser2) await cognitoUser2.signOut();
            if (cognitoUser3) await cognitoUser3.signOut();

            // Delete users
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            } 

            if (userId3) {
                const deleteResponse3 = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId3} })
                }).promise();
                const deleteResponseJSON3 = JSON.parse(deleteResponse3.Payload);
                expect(deleteResponseJSON3.statusCode).toBe(200);
            }

            if (userId2) {
                const deleteResponse2 = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId2} })
                }).promise();
                const deleteResponseJSON2 = JSON.parse(deleteResponse2.Payload);
                expect(deleteResponseJSON2.statusCode).toBe(200);
            }
        }
    });
});

// getUsersByType lambda
describe('GetUsersByType', () => {
	jest.setTimeout(10000);    
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Invalid userId
    it ('Test invalid userId', async() => {
        try {
            // Wrong user type
            const getResponse = await lambda.invoke({
                FunctionName: 'GetUsersByType',
                Payload: JSON.stringify({ pathParameters: { userType: 3 } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(400);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual({error: "Invalid userType"});

            // Non-existent user type
            const getResponse2 = await lambda.invoke({
                FunctionName: 'GetUsersByType',
                Payload: JSON.stringify({ pathParameters: { userId: "invalid" } })
            }).promise();
            const getResponseJSON2 = JSON.parse(getResponse2.Payload);
            expect(getResponseJSON2.statusCode).toBe(400);
            const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
            expect(getResponseJSONBody2).toEqual({error: "Invalid userType"});
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
        }
    });

    // Basic getUsersByType
	it('Test basic getUsersByType', async () => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        let cognitoUser3, userId3;
        try {
            // Register and login teacher user
            const email = 'testTeacher@example.com';
            const username = 'testTeacher';
            const userType = 'Teacher';
            const firstName = 'testTeacher';
            const lastName = 'testTeacher';
            const password = 'testTeacher';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Register and login student user
            const email2 = 'testStudent@example.com';
            const username2 = 'testStudent';
            const userType2 = 'Student';
            const firstName2 = 'testStudent';
            const lastName2 = 'testStudent';
            const password2 = 'testStudent';
            ({ cognitoUser: cognitoUser2, userId: userId2 } = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2));

            // Register and login 2nd teacher user
            const email3 = 'testTeacher2@example.com';
            const username3 = 'testTeacher2';
            const userType3 = 'Teacher';
            const firstName3 = 'testTeacher2';
            const lastName3 = 'testTeacher2';
            const password3 = 'testTeacher2';
            ({ cognitoUser: cognitoUser3, userId: userId3 } = await registerAndLogin(userPool, email3, username3, userType3, firstName3, lastName3, password3));

            // Get teachers
            const getResponse = await lambda.invoke({
                FunctionName: 'GetUsersByType',
                Payload: JSON.stringify({ pathParameters: { userType: "Teacher" } })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                expect.objectContaining({
                    users: expect.arrayContaining([
                        expect.objectContaining({
                            userId: userId,
                            email: email,
                            username: username,
                            userType: userType,
                            firstName: firstName,
                            lastName: lastName,
                            aboutMe: "",
                            teacherReviews: []
                        }),
                        expect.objectContaining({
                            userId: userId3,
                            email: email3,
                            username: username3,
                            userType: userType3,
                            firstName: firstName3,
                            lastName: lastName3,
                            aboutMe: "",
                            teacherReviews: []
                        })
                    ])
                })
            );
            

            // Get students
            const getResponse2 = await lambda.invoke({
                FunctionName: 'GetUsersByType',
                Payload: JSON.stringify({ pathParameters: { userType: "Student" } })
            }).promise();
            const getResponseJSON2 = JSON.parse(getResponse2.Payload);
            expect(getResponseJSON2.statusCode).toBe(200);
            const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
            expect(getResponseJSONBody2).toEqual(
                expect.objectContaining({
                    users: expect.arrayContaining([
                        expect.objectContaining({
                            userId: userId2,
                            email: email2,
                            username: username2,
                            userType: userType2,
                            firstName: firstName2,
                            lastName: lastName2,
                            aboutMe: "",
                            teacherReviews: []
                        })
                    ])
                })
            )

            // Get parents - not contain any users added in this test
            const getResponse3 = await lambda.invoke({
                FunctionName: 'GetUsersByType',
                Payload: JSON.stringify({ pathParameters: { userType: "Parent" } })
            }).promise();
            const getResponseJSON3 = JSON.parse(getResponse3.Payload);
            expect(getResponseJSON3.statusCode).toBe(200);
            const getResponseJSONBody3 = JSON.parse(getResponseJSON3.body);
            expect(getResponseJSONBody3).not.toEqual(
                expect.objectContaining({
                    users: expect.arrayContaining([
                        expect.objectContaining({
                            userId: userId2,
                            email: email2,
                            username: username2,
                            userType: userType2,
                            firstName: firstName2,
                            lastName: lastName2,
                            aboutMe: "",
                            teacherReviews: []
                        })
                    ])
                })
            )
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out users
            if (cognitoUser) await cognitoUser.signOut();
            if (cognitoUser2) await cognitoUser2.signOut();
            if (cognitoUser3) await cognitoUser3.signOut();

            // Delete users
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            } 

            if (userId2) {
                const deleteResponse2 = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId2} })
                }).promise();
                const deleteResponseJSON2 = JSON.parse(deleteResponse2.Payload);
                expect(deleteResponseJSON2.statusCode).toBe(200);
            }

            if (userId3) {
                const deleteResponse3 = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId3} })
                }).promise();
                const deleteResponseJSON3 = JSON.parse(deleteResponse3.Payload);
                expect(deleteResponseJSON3.statusCode).toBe(200);
            }
        }
    });
});

// addTeacherReview lambda
describe('AddTeacherReview', () => {
	jest.setTimeout(10000);    
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Invalid input
    it ('Test invalid input', async() => {
        let cognitoUser, userId;
        let cognitoUser2, userId2;
        try {
            // Register and login user
            const email = 'testStudent@example.com';
            const username = 'testStudent';
            const userType = 'Student';
            const firstName = 'testStudent';
            const lastName = 'testStudent';
            const password = 'testStudent';
            ({ cognitoUser: cognitoUser, userId: userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            const email2 = 'testTeacher@example.com';
            const username2 = 'testTeacher';
            const userType2 = 'Teacher';
            const firstName2 = 'testTeacher';
            const lastName2 = 'testTeacher';
            const password2 = 'testTeacher';
            ({ cognitoUser: cognitoUser2, userId: userId2} = await registerAndLogin(userPool, email2, username2, userType2, firstName2, lastName2, password2));

            // Wrong user id type
            const response = await lambda.invoke({
                FunctionName: 'AddTeacherReview',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: 3, rating: 5, reviewMsg: "Good" }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(400);
            const responseJSONBody = JSON.parse(responseJSON.body);
            expect(responseJSONBody).toEqual({error: "Invalid userId"});

            // Wrong user type
            const response2 = await lambda.invoke({
                FunctionName: 'AddTeacherReview',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId, rating: 5, reviewMsg: "Good" }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(400);
            const responseJSONBody2 = JSON.parse(responseJSON2.body);
            expect(responseJSONBody2).toEqual({error: "Invalid userType"});

            // Wrong rating value
            const response3 = await lambda.invoke({
                FunctionName: 'AddTeacherReview',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId2, rating: 7, reviewMsg: "Good" }) })
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(400);
            const responseJSONBody3 = JSON.parse(responseJSON3.body);
            expect(responseJSONBody3).toEqual({error: "Invalid rating"});

            // Wrong reviewMsg type
            const response4 = await lambda.invoke({
                FunctionName: 'AddTeacherReview',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId2, rating: 0, reviewMsg: 3 }) })
            }).promise();
            const responseJSON4 = JSON.parse(response4.Payload);
            expect(responseJSON4.statusCode).toBe(400);
            const responseJSONBody4 = JSON.parse(responseJSON4.body);
            expect(responseJSONBody4).toEqual({error: "Invalid reviewMsg"});

            // Non-existent user id
            const response5 = await lambda.invoke({
                FunctionName: 'AddTeacherReview',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: "invalid", rating: 5, reviewMsg: "Good" }) })
            }).promise();
            const responseJSON5 = JSON.parse(response5.Payload);
            expect(responseJSON5.statusCode).toBe(404);
            const responseJSONBody5 = JSON.parse(responseJSON5.body);
            expect(responseJSONBody5).toEqual({error: "User not found"});
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            if (cognitoUser) await cognitoUser.signOut();
            if (cognitoUser2) await cognitoUser2.signOut();

            // Delete users
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            } 

            if (userId2) {
                const deleteResponse2 = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId2} })
                }).promise();
                const deleteResponseJSON2 = JSON.parse(deleteResponse2.Payload);
                expect(deleteResponseJSON2.statusCode).toBe(200);
            }
        }
    });

    // Basic addTeacherReview
	it('Test basic addTeacherReview', async () => {
        let cognitoUser, userId;
        try {
            // Register and login user
            const email = 'testTeacher@example.com';
            const username = 'testTeacher';
            const userType = 'Teacher';
            const firstName = 'testTeacher';
            const lastName = 'testTeacher';
            const password = 'testTeacher';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Add teacher review
            const response = await lambda.invoke({
                FunctionName: 'AddTeacherReview',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId, rating: 5, reviewMsg: "Good" }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);

            // Add 2nd teacher review
            const response2 = await lambda.invoke({
                FunctionName: 'AddTeacherReview',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId, rating: 3, reviewMsg: "Alright" }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            // Get teacher review
            const getResponse = await lambda.invoke({
                FunctionName: 'GetUser',
                Payload: JSON.stringify({ pathParameters: { userId: userId} })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    userId: userId,
                    email: email,
                    username: username,
                    userType: userType,
                    firstName: firstName,
                    lastName: lastName,
                    aboutMe: "",
                    teacherReviews: 
                    [
                        {
                            rating: 5,
                            reviewMsg: "Good"
                        },
                        {
                            rating: 3,
                            reviewMsg: "Alright"
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

            // Delete user
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
        }
    });
});

// updateUser lambda
describe('UpdateUser', () => {
	jest.setTimeout(10000);    
    const poolData = {
        UserPoolId: process.env.USERPOOL_ID,
        ClientId: process.env.CLIENT_ID
    };
	const userPool = new CognitoUserPool(poolData);

    // Invalid input
    it ('Test invalid input', async() => {
        let cognitoUser, userId;
        try {
            const email = 'testTeacher@example.com';
            const username = 'testTeacher';
            const userType = 'Teacher';
            const firstName = 'testTeacher';
            const lastName = 'testTeacher';
            const password = 'testTeacher';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Wrong user id type
            const response = await lambda.invoke({
                FunctionName: 'UpdateUser',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: 3, firstName: "newFirst", lastName: "newLast", aboutMe: "newAbout" }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(400);
            const responseJSONBody = JSON.parse(responseJSON.body);
            expect(responseJSONBody).toEqual({error: "Invalid userId"});

            // Wrong firstName type
            const response2 = await lambda.invoke({
                FunctionName: 'UpdateUser',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId, firstName: 3, lastName: "newLast", aboutMe: "newAbout" }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(400);
            const responseJSONBody2 = JSON.parse(responseJSON2.body);
            expect(responseJSONBody2).toEqual({error: "Invalid firstName"});

            // Wrong lastName type
            const response3 = await lambda.invoke({
                FunctionName: 'UpdateUser',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId, firstName: "newFirst", lastName: 3, aboutMe: "newAbout" }) })
            }).promise();
            const responseJSON3 = JSON.parse(response3.Payload);
            expect(responseJSON3.statusCode).toBe(400);
            const responseJSONBody3 = JSON.parse(responseJSON3.body);
            expect(responseJSONBody3).toEqual({error: "Invalid lastName"});

            // Non-existent user id
            const response5 = await lambda.invoke({
                FunctionName: 'UpdateUser',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: "invalid", firstName: "newFirst", lastName: "newLast", aboutMe: "newAbout" }) })
            }).promise();
            const responseJSON5 = JSON.parse(response5.Payload);
            expect(responseJSON5.statusCode).toBe(404);
            const responseJSONBody5 = JSON.parse(responseJSON5.body);
            expect(responseJSONBody5).toEqual({error: "User not found"});
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            if (cognitoUser) await cognitoUser.signOut();

            // Delete users
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            } 
        }
    });

    // Basic updateUser
	it('Test basic updateUser', async () => {
        let cognitoUser, userId;
        try {
            // Register and login user
            const email = 'testTeacher@example.com';
            const username = 'testTeacher';
            const userType = 'Teacher';
            const firstName = 'testTeacher';
            const lastName = 'testTeacher';
            const password = 'testTeacher';
            ({ cognitoUser, userId } = await registerAndLogin(userPool, email, username, userType, firstName, lastName, password));

            // Update first name and lastname
            const response = await lambda.invoke({
                FunctionName: 'UpdateUser',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId, firstName: "newFirst", lastName: "newLast", aboutMe: "" }) })
            }).promise();
            const responseJSON = JSON.parse(response.Payload);
            expect(responseJSON.statusCode).toBe(200);

            // Get teacher
            const getResponse = await lambda.invoke({
                FunctionName: 'GetUser',
                Payload: JSON.stringify({ pathParameters: { userId: userId} })
            }).promise();
            const getResponseJSON = JSON.parse(getResponse.Payload);
            expect(getResponseJSON.statusCode).toBe(200);
            const getResponseJSONBody = JSON.parse(getResponseJSON.body);
            expect(getResponseJSONBody).toEqual(
                {
                    userId: userId,
                    email: email,
                    username: username,
                    userType: userType,
                    firstName: "newFirst",
                    lastName: "newLast",
                    aboutMe: "",
                    teacherReviews: []
                }
            )

            // Update aboutme
            const response2 = await lambda.invoke({
                FunctionName: 'UpdateUser',
                Payload: JSON.stringify({ body: JSON.stringify({ userId: userId, firstName: "newFirst", lastName: "newLast", aboutMe: "newAbout" }) })
            }).promise();
            const responseJSON2 = JSON.parse(response2.Payload);
            expect(responseJSON2.statusCode).toBe(200);

            // Get teacher
            const getResponse2 = await lambda.invoke({
                FunctionName: 'GetUser',
                Payload: JSON.stringify({ pathParameters: { userId: userId} })
            }).promise();
            const getResponseJSON2 = JSON.parse(getResponse2.Payload);
            expect(getResponseJSON2.statusCode).toBe(200);
            const getResponseJSONBody2 = JSON.parse(getResponseJSON2.body);
            expect(getResponseJSONBody2).toEqual(
                {
                    userId: userId,
                    email: email,
                    username: username,
                    userType: userType,
                    firstName: "newFirst",
                    lastName: "newLast",
                    aboutMe: "newAbout",
                    teacherReviews: []
                }
            )
        } catch (error) {
            console.error("An error occurred during setup or operation:", error);
            throw error;
        } finally {
            // Sign out user
            if (cognitoUser) await cognitoUser.signOut();

            // Delete user
            if (userId) {
                const deleteResponse = await lambda.invoke({
                    FunctionName: 'DeleteUser',
                    Payload: JSON.stringify({ pathParameters: { userId: userId} })
                }).promise();
                const deleteResponseJSON = JSON.parse(deleteResponse.Payload);
                expect(deleteResponseJSON.statusCode).toBe(200);
            }
        }
    });
});