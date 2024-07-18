import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../styles/auth.css';
import '../styles/mobile_auth.css';
import { poolData } from '../config/poolData';

const UserPool = new CognitoUserPool(poolData);

const Register: React.FC = () => {
  const [userType, setUserType] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);


  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    // Initialize dark mode state from local storage
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'enabled') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    if (!isDarkMode) {
      localStorage.setItem('darkMode', 'enabled');
      document.body.classList.add('dark-mode');
      console.log("black time");
    } else {
      localStorage.setItem('darkMode', 'disabled');
      document.body.classList.remove('dark-mode');
      console.log("white time");
    }
  };

  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9]+@[a-zA-Z\.]+$/;
    return regex.test(email);
  };

  const handleUserTypeClick = (type: string) => {
    setUserType(type);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'email') setEmail(value);
    if (id === 'first-name') setFirstName(value);
    if (id === 'last-name') setLastName(value);
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
    console.log(poolData)
    if (!userType) {
      setErrorMessage("Please select a user type");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (firstName.length < 2) {
      setErrorMessage("First name too short");
      return;
    }
    if (lastName.length < 2) {
      setErrorMessage("Last name too short");
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

    const attributeEmail = new CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    const postUserDetails = async () => {
      await fetch('https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          username: username,
          userType: userType,
          firstName: firstName,
          lastName: lastName
        }),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
          }
          else {
            console.log(response);
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          localStorage.setItem('id', data.userId);
        })
        .catch(error => {
          console.error('Error:', error.message, error.code || error);
        });
    };

    UserPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        const queryParams = new URLSearchParams({ firstName, lastName, userType, email, password, username });
        postUserDetails();
        window.location.href = `/verification?${queryParams.toString()}`;
      }
    });
  };

  return (
    <div className="auth-screen">
      <div className="auth-banner">
        <h1 className="header-logo">Mewsic</h1>
        <img className="gif" src="https://media0.giphy.com/media/CPWmNCzfMFgC8QUAbp/giphy.gif?cid=6c09b952s5rjd6w005v10j0yd1movcoho6iaixxs3pdguhig&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s" />
      </div>
      <div className="auth-container">
        <h2 className="auth-header">Register</h2>
        <div className="input-container user-type">
          {['Student', 'Parent', 'Teacher'].map((type) => (
            <button
              key={type}
              className={`button2 ${userType === type ? 'selected' : ''}`}
              type="button"
              onClick={() => handleUserTypeClick(type)}
              onMouseEnter={(e) => e.currentTarget.classList.add('hovered')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('hovered')}
            >
              {type}
            </button>
          ))}
        </div>
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
        <div className="input-container">
          <input
            className="form-inputs"
            placeholder=""
            type="text"
            id="first-name"
            value={firstName}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <label htmlFor="first-name">First Name</label>
        </div>
        <div className="input-container">
          <input
            className="form-inputs"
            placeholder=""
            type="text"
            id="last-name"
            value={lastName}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <label htmlFor="last-name">Last Name</label>
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
        <p className="auth-text">────────── Or Continue With ──────────</p>
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
        <span className="auth-text">Already have an account? <a className="anchor1" href="/">Log In</a></span>
        <div className="dark-mode-toggle">
          <label htmlFor="darkModeSwitch">Dark Mode</label>
          <input
            type="checkbox"
            id="darkModeSwitch"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;