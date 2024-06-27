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
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const randomX = Math.random() * (window.innerWidth - 128);
    const randomY = Math.random() * (window.innerHeight - 128);
    setPosition({ x: randomX, y: randomY });
  }, []);

  const login = async () => {
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

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div className="auth-screen">
      <img src={"https://cdn-icons-png.flaticon.com/128/461/461238.png"} alt="Note" className="drag" draggable="false"
          onMouseDown={handleMouseDown}
          style={{ position: 'absolute', top: position.y, left: position.x, cursor: 'move' }}/>
      <h1 className="header-logo">Mewsic 🎵</h1>
      <div className="auth-container">
        <h2 className="auth-header">Login</h2>
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
