import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

export const poolData = {
  UserPoolId: process.env.USERPOOL_ID,
  ClientId: process.env.CLIENT_ID,
};
