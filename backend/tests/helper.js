const { CognitoUserAttribute, AuthenticationDetails, CognitoUser } = require('amazon-cognito-identity-js');

const registerAndLogin = async(userPool, email, username, userType, firstName, lastName, password) => {
    const attributeList = [];
    attributeList.push(new CognitoUserAttribute({
        Name: 'email',
        Value: email
    }));
    attributeList.push(new CognitoUserAttribute({
        Name: 'custom:username',
        Value: username
    }));
    attributeList.push(new CognitoUserAttribute({
        Name: 'custom:userType',
        Value: userType
    }));
    attributeList.push(new CognitoUserAttribute({
        Name: 'custom:firstName',
        Value: firstName
    }));
    attributeList.push(new CognitoUserAttribute({
        Name: 'custom:lastName',
        Value: lastName
    }));

    // Sign up user
    await new Promise((resolve, reject) => {
        userPool.signUp(username, password, attributeList, null, (err, result) => {
            if (err) {
            return reject(err);
            }
            resolve(result);
        });
    });
        
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
    return {"cognitoUser": cognitoUser, "userId": userId};
}

module.exports = registerAndLogin;