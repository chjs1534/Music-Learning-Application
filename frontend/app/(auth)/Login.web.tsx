import React, { useEffect, useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUserSession,
  ISignUpResult
} from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';

interface Position {
  x: number;
  y: number;
}

const UserPool = new CognitoUserPool(poolData);

export const authenticate = (Email: string, Password: string): Promise<CognitoUserSession> => {
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
      onSuccess: (result: CognitoUserSession) => {
        console.log("login successful");
        resolve(result);
      },
      onFailure: (err: Error) => {
        console.log("login failed", err);
        reject(err);
      }
    });
  });
};

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [dragging, setDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
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

    try {
      await authenticate(username, password);

      const authToken = await new Promise<string | null>((resolve, reject) => {
        const cognitoUser = UserPool.getCurrentUser();
        if (cognitoUser) {
          cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
            if (err) {
              reject(err);
            } else if (!session?.isValid()) {
              resolve(null);
            } else {
              resolve(session?.getIdToken().getJwtToken() || null);
            }
          });
        } else {
          resolve(null);
        }
      });
      navigate('/homepage', { state: { authToken } });
    } catch (err) {
      console.log(err);
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e: MouseEvent<Document>) => {
    if (dragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
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
      <img
        src="https://cdn-icons-png.flaticon.com/128/461/461238.png"
        alt="Note"
        className="drag"
        draggable="false"
        onMouseDown={handleMouseDown}
        style={{ position: 'absolute', top: position.y, left: position.x, cursor: 'move' }}
      />
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
