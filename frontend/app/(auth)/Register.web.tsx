import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../styles/auth.css';
import { USERPOOL_ID, CLIENT_ID } from '@env';

const poolData = {
  UserPoolId: USERPOOL_ID,
  ClientId: CLIENT_ID
};

const UserPool = new CognitoUserPool(poolData);

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    console.log(username);
  }, [username]);

  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9]+@[a-zA-Z\.]+$/;
    return regex.test(email);
  };

  const register = async () => {
    if (username.length <= 3) {
      alert("Username must be longer than 3 characters");
      return;
    }
    if (password.length <= 8) {
      alert("Password must be longer than 8 characters");
      return;
    }
    if (!validateEmail(email)) {
      alert("Invalid email format");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    let attributeList = [];
    let dataEmail = {
      Name: 'email',
      Value: email
    };
    let dataUsername = {
      Name: 'username',
      Value: username
    };
    let attributeEmail = new CognitoUserAttribute(dataEmail);
    let attributeUsername = new CognitoUserAttribute(dataUsername);

    attributeList.push(attributeEmail);
    attributeList.push(attributeUsername);

    UserPool.signUp(
      email,
      password,
      attributeList,
      null,
      (err, data) => {
        if (err) console.error(err);
        else navigate('/verification', { state: { email, password } });
      }
    );
  }

  return (
    <div className="auth-screen">
      <h1 className="header-logo">Mewsic 🎵</h1>
      <div className="auth-container">
        <h2 className="auth-header">Register</h2>
        <input
          className="form-inputs"
          placeholder="email"
          type="text"
          id="name"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-inputs"
          placeholder="username"
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
        <input
          className="form-inputs"
          placeholder="confirm password"
          type="password"
          id="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="button1" type="submit" onClick={register}>Register</button>
        <span>Already have an account? <a className="anchor1" href="/login">Log In</a></span>
      </div>
    </div>
  );
};

export default Register;
