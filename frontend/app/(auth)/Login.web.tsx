import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { USERPOOL_ID, CLIENT_ID } from '@env';

const poolData = {
  UserPoolId: USERPOOL_ID,
  ClientId: CLIENT_ID,
};

const UserPool = new CognitoUserPool(poolData);

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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    // Input error checking
    if (username.length <= 3) {
      alert("Username must be longer than 3 characters");
      return;
    }
    if (password.length < 8) {
      alert("Password must be longer than 8 characters");
      return;
    }

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
        <h2>Login</h2>
        <input
          className="form-inputs"
          placeholder="username/email"
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="form-inputs"
          placeholder="password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="button1" type="submit" onClick={login}>Login</button>
        <span>Don't have an account? <a className="anchor1" href="/register">Register Now</a></span>
      </div>
    </div>

  );
};

export default Login;
