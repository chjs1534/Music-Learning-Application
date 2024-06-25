import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();



  // call something for remember me 
  // useEffect(() => {
  //   if (props.token) {
  //     navigate('/home')
  //   
  // }, [props.token]);

  // login logic here set token for above 
  const login = async () => {
    
  }

  return (
    <div className="auth-screen">
      <h1>Mewsic 🎵</h1>
      <div className="auth-container">
        <h2>Login</h2>
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
              <span>Don't have an account? <a className="anchor1" href="/login">Register Now</a></span>
      </div>
    </div>
    
  );
};

export default Login;
