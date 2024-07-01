import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../styles/auth.css';
import { poolData } from '../config/poolData';

const UserPool = new CognitoUserPool(poolData);

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

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

    const attributeList: CognitoUserAttribute[] = [];
    const dataEmail = {
      Name: 'email',
      Value: email
    };
    const dataUsername = {
      Name: 'username',
      Value: username
    };
    const attributeEmail = new CognitoUserAttribute(dataEmail);
    const attributeUsername = new CognitoUserAttribute(dataUsername);

    attributeList.push(attributeEmail);
    attributeList.push(attributeUsername);

    UserPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        navigate('/verification', { state: { email, password } });
      }
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'email') setEmail(value);
    if (id === 'username') setUsername(value);
    if (id === 'password') setPassword(value);
    if (id === 'confirmPassword') setConfirmPassword(value);
  };

  return (
    <div className="auth-screen">
      <h1 className="header-logo">Mewsic 🎵</h1>
      <div className="auth-container">
        <h2 className="auth-header">Register</h2>
        <input
          className="form-inputs"
          placeholder="email"
          type="text"
          id="email"
          value={email}
          onChange={handleInputChange}
        />
        <input
          className="form-inputs"
          placeholder="username"
          type="text"
          id="username"
          value={username}
          onChange={handleInputChange}
        />
        <input
          className="form-inputs"
          placeholder="password"
          type="password"
          id="password"
          value={password}
          onChange={handleInputChange}
        />
        <input
          className="form-inputs"
          placeholder="confirm password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={handleInputChange}
        />
        <button className="button1" type="submit" onClick={register}>Register</button>
        <span>Already have an account? <a className="anchor1" href="/login">Log In</a></span>
      </div>
    </div>
  );
};

export default Register;
