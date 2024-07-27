import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';

export const poolData = {
    UserPoolId: process.env.USERPOOL_ID,
    ClientId: process.env.CLIENT_ID,
};
try {
    const UserPool = new CognitoUserPool(poolData);
    // console.log(poolData.UserPoolId, poolData.ClientId)
} catch (e) {
    console.error(e)
}