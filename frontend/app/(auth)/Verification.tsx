import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/auth.css';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';

interface LocationState {
  email: string;
  password: string;
}

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
      console.log("V11", err);
    } else {
      callback(null, result);
      console.log("V12");
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
  // const navigate = useNavigate();
  // const location = useLocation();
  // const userType = location.state?.userType || 'no';
  // const email = location.state?.email || 'no2';
  // const password = location.state?.password || '3';

  const queryParams = new URLSearchParams(location.search);
  const userType = queryParams.get('userType') || '';
  const email = queryParams.get('email') || '';
  const password = queryParams.get('password') || '';

  console.log(userType, email, password)

  useEffect(() => {
    if (!userType || !email || !password) {
      const queryParams = new URLSearchParams({ email, password });
      window.location.href = `/register?${queryParams.toString()}`;
    }
  }, [userType, email, password]);

  const verify = async () => {
    try {
      await verifyUser(email, verificationCode, (err, result) => {
        if (err) {
          console.error(err);
          console.log("Verification not successful");
        } else {
          console.log("Verification successful");
        }
      });

      const authToken = await authenticate(email, password);
      if (authToken) {
        // navigate('/homepage', { state: { authToken } });
        const queryParams = new URLSearchParams({ authToken, userType, email, password });
        window.location.href = `/homepage?${queryParams.toString()}`;
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
