const aws = require('aws-sdk');
const { CognitoUserPool, CognitoUserAttribute, AuthenticationDetails, CognitoUser } = require('amazon-cognito-identity-js');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
require('dotenv').config();

aws.config.update({region:'ap-southeast-2'})
const cognito = new aws.CognitoIdentityServiceProvider();
const lambda = new aws.Lambda();

describe('Basic', () => {
	jest.setTimeout(15000);
	let poolData;
	let userPool;

	it('basic register, signin, delete', async () => {
		const email = 'test@example.com';
		const username = 'testStudent';
		const userType = 'Parent';
		const firstName = 'first';
		const lastName = 'last';
		const password = 'TestPassword123!';
		poolData = {
			UserPoolId: process.env.USERPOOL_ID,
			ClientId: process.env.CLIENT_ID
		}
		userPool = new CognitoUserPool(poolData);

		const attributeList = [];
		const attributeEmail = new CognitoUserAttribute({
			Name: 'email',
			Value: email
		});
		const attributeUsername = new CognitoUserAttribute({
			Name: 'custom:username',
			Value: username
		});
		const attributeUserType = new CognitoUserAttribute({
			Name: 'custom:userType',
			Value: userType
		});
		const attributeFirstName = new CognitoUserAttribute({
			Name: 'custom:firstName',
			Value: firstName
		});
		const attributeLastName = new CognitoUserAttribute({
			Name: 'custom:lastName',
			Value: lastName
		});
			
		attributeList.push(attributeEmail);
		attributeList.push(attributeUsername);
		attributeList.push(attributeUserType);
		attributeList.push(attributeFirstName);
		attributeList.push(attributeLastName);

		// Sign up user
		const result = await new Promise((resolve, reject) => {
			userPool.signUp(username, password, attributeList, null, (err, result) => {
				if (err) {
				return reject(err);
				}
				resolve(result);
			});
		});
		console.log(result);
		expect(result.user).toBeDefined();
		expect(result.user.getUsername()).toBeDefined();

		// Check user in user pool
		const user = await cognito.adminGetUser({
			UserPoolId: poolData.UserPoolId,
			Username: username
		}).promise();
		expect(user.UserAttributes).toContainEqual(expect.objectContaining({
			Name: 'custom:username',
			Value: username
		}));
		const subAttribute = user.UserAttributes.find(attr => attr.Name === 'sub');
		const userSub = subAttribute ? subAttribute.Value : null;

		// Check user in database
		const payload = JSON.stringify({ pathParameters: { userId: userSub } });
		const params = {
			FunctionName: 'GetUser',
			Payload: payload
		};
		const lambdaResponse = await lambda.invoke(params).promise();
		const result3 = JSON.parse(lambdaResponse.Payload);
		console.log(result3);
		expect(result3.statusCode).toBe(200);
		const body3 = JSON.parse(result3.body)
		expect(body3.userId).toEqual(userSub);
		expect(body3.username).toEqual(username);
			
		// Sign in user gets user id and auth token
		let jwtToken;
		let userId;
		const authenticationDetails = new AuthenticationDetails({
			Username: username,
			Password: password,
		});
		const userData = {
			Username : username,
			Pool : userPool
		};
		const cognitoUser = new CognitoUser(userData);
		await new Promise((resolve, reject) => {
			cognitoUser.authenticateUser(authenticationDetails, {
				onSuccess: function (result) {
					jwtToken = result.idToken.jwtToken;
					const jwtPayload = JSON.parse(atob(jwtToken.split('.')[1]));
					userId = jwtPayload.sub;
					resolve();
				},
				onFailure: function(err) {
					reject(err);
				},
			});
		});
		// Check correct user id from sign in
		expect(userId).toEqual(userSub);

		// Verify JWT token
		expect(jwtToken).toBeDefined();
		const verifier = CognitoJwtVerifier.create({
			userPoolId: poolData.UserPoolId,
			clientId: poolData.ClientId,
			tokenUse: "id",
		});
		await verifier.verify(jwtToken);

		// Sign out user
		cognitoUser.signOut();

		// Attempt to verify JWT token, should fail
		try {
			await verifier.verify(jwtToken);
			throw new Error("Token should be invalid after sign out");
		} catch (err) {
			expect(err).toBeDefined();
		}

		// Clean up by deleting user
		const deleteParams = {
				FunctionName: 'DeleteUser',
				Payload: payload
		};
		const deleteResponse = await lambda.invoke(deleteParams).promise();
		const result4 = JSON.parse(deleteResponse.Payload);
		console.log(result4);
		expect(result4.statusCode).toBe(200);

		// Check user in user pool
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
		
		// Check user in database
		const lambdaResponse2 = await lambda.invoke(params).promise();
		const result5 = JSON.parse(lambdaResponse2.Payload);
		console.log(result5);
		expect(result5.statusCode).toBe(404);
	});
});

