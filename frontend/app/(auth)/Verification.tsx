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

  const queryParams = new URLSearchParams(location.search);
  const userType = queryParams.get('userType') || '';
  const username = queryParams.get('username') || '';
  const firstName = queryParams.get('firstName') || '';
  const lastName = queryParams.get('lastName') || '';
  const email = queryParams.get('email') || '';
  const password = queryParams.get('password') || '';

  const [userId, setUserId] = useState<string | null>(null);

  console.log(userType, email, username, password, userId)

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
        console.log(authToken)
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUserId/${email}`, {
          method: 'GET',
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          },
        }).then(response => {
          if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
          }
          else {
            console.log(response);
          }
          return response.json();
        })
          .then(data => {
            console.log('Successlelelele:', data);
            localStorage.setItem('id', data.userId);
            localStorage.setItem('userType', data.userType);
            setUserId(data.userId);
            console.log(data);

            if (data.userType == "Student") {
              console.log("registering student");
              const registerMobile = async () => {

                const attributeList: CognitoUserAttribute[] = [];
                const dataUsername = { Name: 'username', Value: username };
                const attributeUsername = new CognitoUserAttribute(dataUsername);

                attributeList.push(attributeUsername);

                UserPool.signUp(username, password, attributeList, null, (err, result) => {
                  if (err) {
                    console.log(err.message || JSON.stringify(err));
                  } else {
                    // setAccounts(prevAccounts => [...prevAccounts, { username }]);
                    // setUsername('');
                    // setPassword('');
                    // setConfirmPassword('');
                    // setShowModal(false);
                    // setErrorMessage('');
                    console.log("ye sye yes");
                  }
                });
              };
              registerMobile();
            }
          })
          .catch(error => {
            console.error('Error:', error.message, error.code || error);
          });

        const queryParams = new URLSearchParams();
        // window.location.href = `/homepage?${queryParams.toString()}`;
        localStorage.setItem('token', authToken);
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
      <div className="auth-banner">
        <h1 className="header-logo">Mewsic</h1>
        <img className="gif" src="https://media0.giphy.com/media/CPWmNCzfMFgC8QUAbp/giphy.gif?cid=6c09b952s5rjd6w005v10j0yd1movcoho6iaixxs3pdguhig&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s" />
      </div>
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
