import React, { useState, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/auth.css';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { USERPOOL_ID, CLIENT_ID } from '@env';

interface LocationState {
  email: string;
  password: string;
}

const poolData = {
  UserPoolId: USERPOOL_ID,
  ClientId: CLIENT_ID,
};

const UserPool = new CognitoUserPool(poolData);

export const verifyUser = (
  email: string,
  verifyCode: string,
  callback: (err: Error | null, result?: 'SUCCESS' | 'CONFIRMATION_REQUIRED') => void
): void => {
  const user = new CognitoUser({
    Username: email,
    Pool: UserPool
  });

  user.confirmRegistration(verifyCode, true, (err: Error | null, result: 'SUCCESS' | 'CONFIRMATION_REQUIRED') => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

export const authenticate = (Email: string, Password: string): Promise<string | null> => {
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
        resolve(result.getIdToken().getJwtToken());
      },
      onFailure: (err) => {
        console.log("login failed", err);
        reject(err);
      }
    });
  });
};

const Verification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.email || '';
  const password = location.state?.password || '';

  const verify = async () => {
    try {
      await verifyUser(username, verificationCode, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Verification successful");
        }
      });

      const authToken = await authenticate(username, password);
      if (authToken) {
        navigate('/homepage', { state: { authToken } });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  return (
    <div className="auth-screen">
      <h1>Mewsic 🎵</h1>
      <div className="auth-container">
        <h2>Please Enter Your Verification Code</h2>
        <input
          className="form-inputs"
          placeholder="Verification Code"
          type="text"
          id="verificationCode"
          value={verificationCode}
          onChange={handleInputChange}
        />
        <button className="button1" type="button" onClick={verify}>Verify</button>
      </div>
    </div>
  );
};

export default Verification;
