import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/auth.css';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { USERPOOL_ID, CLIENT_ID } from '@env';

const poolData = {
    UserPoolId: USERPOOL_ID,
    ClientId: CLIENT_ID,
};

const UserPool = new CognitoUserPool(poolData);

export const verifyUser = (email, verifyCode, callback) => {
    const user = new CognitoUser({
        Username: email,
        Pool: UserPool
    });

    user.confirmRegistration(verifyCode, true, callback);
}

export const authenticate = (Email, Password) => {
    return new Promise((resolve, reject) => {
        const user = new CognitoUser({
            Username: Email,
            Pool: UserPool
        });

        const authDetails = new AuthenticationDetails({
            Username: Email,
            Password
        });

        user.authenticateUser(authDetails, {
            onSuccess: (result) => {
                console.log("login successful");
                resolve(result);
            },
            onFailure: (err) => {
                console.log("login failed", err);
                reject(err);
            }
        });
    });
};

const Verification = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.email;
    const password = location.state?.password;

    const verify = async () => {
        const callback = (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log("its time to be a korean")
            }
        };

        await verifyUser(username, verificationCode, callback);

        authenticate(username, password)
            .then((data) => {
                new Promise(function fetchCurrentAuthToken(resolve, reject) {
                    var cognitoUser = UserPool.getCurrentUser();
                    if (cognitoUser) {
                        cognitoUser.getSession(function sessionCallback(err, session) {
                            if (err) {
                                reject(err);
                            } else if (!session.isValid()) {
                                resolve(null);
                            } else {
                                resolve(session.getIdToken().getJwtToken());
                            }
                        });
                    } else {
                        resolve(null);
                    }
                })
                    .then(authToken => { navigate('/homepage', { state: { authToken } }) })
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div className="auth-screen">
            <h1>Mewsic 🎵</h1>
            <div className="auth-container">
                <h2>Please Enter Your Verification Code</h2>
                <input
                    className="form-inputs"
                    placeholder="Verification Code"
                    type="text"
                    id="username"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button className="button1" type="button" onClick={verify}>Verify</button>
            </div>
        </div>
    );
};

export default Verification;