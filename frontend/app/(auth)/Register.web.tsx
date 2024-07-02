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
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);

  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9]+@[a-zA-Z\.]+$/;
    return regex.test(email);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'email') setEmail(value);
    if (id === 'username') setUsername(value);
    if (id === 'password') setPassword(value);
    if (id === 'confirmPassword') setConfirmPassword(value);
  };

  const handleInputFocus = (e: ChangeEvent<HTMLInputElement>) => {
    const { id } = e.target;
    const label = document.querySelector(`label[for=${id}]`);
    if (label) {
      label.classList.add('active');
    }
  };

  const handleInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const label = document.querySelector(`label[for=${id}]`);
    if (label && !value) {
      label.classList.remove('active');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const register = async () => {
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (username.length < 3) {
      setErrorMessage("Username must be longer than 3 characters");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be longer than 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
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
        console.log(result);
        navigate('/verification', { state: { email, password } });
      }
    });
  };

  return (
    <div className="auth-screen">
      <div className="auth-banner">
        <h1 className="header-logo">Mewsic🎵</h1>
      </div>
      <div className="auth-container">
        <h2 className="auth-header">Register</h2>
        <div className="input-container">
          <input
            className="form-inputs"
            placeholder=""
            type="text"
            id="email"
            value={email}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="input-container">
          <input
            className="form-inputs"
            placeholder=""
            type="text"
            id="username"
            value={username}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <label htmlFor="username">Username</label>
        </div>
        <div className="input-container password-container">
          <input
            className="form-inputs"
            placeholder=""
            type={passwordVisible ? "text" : "password"}
            id="password"
            value={password}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <label htmlFor="password">Password</label>
          <img
            src={passwordVisible ? "https://cdn-icons-png.flaticon.com/128/2767/2767146.png" : "https://cdn-icons-png.flaticon.com/128/709/709612.png"}
            alt={passwordVisible ? "Hide password" : "Show password"}
            className="password-toggle"
            onClick={togglePasswordVisibility}
          />
        </div>
        <div className="input-container password-container">
          <input
            className="form-inputs"
            placeholder=""
            type={confirmPasswordVisible ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <img
            src={confirmPasswordVisible ? "https://cdn-icons-png.flaticon.com/128/2767/2767146.png" : "https://cdn-icons-png.flaticon.com/128/709/709612.png"}
            alt={confirmPasswordVisible ? "Hide password" : "Show password"}
            className="password-toggle"
            onClick={toggleConfirmPasswordVisibility}
          />
        </div>
        <div className="error-message-container">
          {errorMessage && <span className="error-message">{'*' + errorMessage}</span>}
        </div>
        <button className="button1" type="submit" onClick={register}>Register</button>
        <p>--- Or Continue With ---</p>
        <div className="alternate-auth-options">
          <img
              src="https://cdn-icons-png.flaticon.com/128/300/300221.png"
              alt="Google"
              className="company-button"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/128/731/731985.png"
              alt="Apple"
              className="company-button"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
              alt="Facebook"
              className="company-button"
            />
        </div>
        <span className="auth-text">Already have an account? <a className="anchor1" href="/login">Log In</a></span>
      </div>
    </div>
  );
};

export default Register;
