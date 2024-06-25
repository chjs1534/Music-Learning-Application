import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    console.log(username);
  }, [username]);

  const register = () => {
    console.log('hi');
    console.log(username, email, password);
    const poolData = {
      UserPoolId: 'ap-southeast-2_mA5H8qPfE',
      ClientId: '4tp5jsv1nh92hahc4md4v9m5vb',
    };

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
    <div className="login-container">
      <h2>Register</h2>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Email:</label>
          <input
            type="text"
            id="name"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" onClick={register}>Register</button>
      <button type="submit" onClick={()=>navigate('/login')}>go to login</button>
    </div>
  );
};

export default Register;
