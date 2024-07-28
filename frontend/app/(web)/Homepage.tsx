import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import NavBar from './NavBar';
import '../styles/website.css';

const Homepage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'enabled') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
    setToken(localStorage.getItem('token'));
    setUserId(localStorage.getItem('id'));
  }, []);

  const clickMe = async () => {
    console.log('authToken:', token);
    console.log('userId:', userId);
  };

  return (
    <div className="homepage">
      <NavBar />
      <div className="dashboard">
        <div className="welcome-section">
          <h1>Welcome to Mewsic</h1>
          <p>Your ultimate destination for mastering musical instruments and music theory.</p>
        </div>
        <div className="content-section">
          <div className="text-box">
            <h2>Discover New Lessons</h2>
            <p>Explore a variety of lessons and tutorials tailored to help you improve your musical skills.</p>
          </div>
          <div className="quote-box">
            <h2>Quote of the Day</h2>
            <p>"Music is the universal language of mankind." - Henry Wadsworth Longfellow</p>
          </div>
        </div>
        <div className="button-section">
          <button className="betton" onClick={clickMe}>click me!</button>
        </div>
        <div className="footer-section">
          <p>© 2024 Mewsic. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
