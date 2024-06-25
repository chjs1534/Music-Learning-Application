import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../styles/auth.css';

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
    // Regular expression to match at least one letter before '@' and at least one letter after '@'
    const regex = /^[a-zA-Z0-9]+@[a-zA-Z]+$/;
    
    return regex.test(email);
  };

  const register = async () => {

    console.log(username, email, password, confirmPassword);
    const poolData = {
      UserPoolId: 'ap-southeast-2_mA5H8qPfE',
      ClientId: '4tp5jsv1nh92hahc4md4v9m5vb',
    };

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
    const UserPool = new CognitoUserPool(poolData);

    var attributeList = [];
    var dataEmail = {
      Name: 'email',
      Value: email
    };
    var dataUsername = {
      Name: 'username',
      Value: username
    };
    var attributeEmail = new CognitoUserAttribute(dataEmail);
    var attributeUsername = new CognitoUserAttribute(dataUsername);

    attributeList.push(attributeEmail);
    attributeList.push(attributeUsername);

    UserPool.signUp(
      email,
      password,
      attributeList,
      null,
      (err, data) => {
        if (err) console.error(err);
        console.log(data);
      }
    );
  }

  // create errors for username email password
  // name > 3
  // password > 8
  // email must be like an email @ + one letter
  return (
    <div className="auth-screen">
      <h1>Mewsic 🎵</h1>
      <div className="auth-container">
        <h2>Register</h2>

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
