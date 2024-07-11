import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import '../styles/fonts.css';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';

const UserPool = new CognitoUserPool(poolData);

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  return (
    <div className="navbar">
      <button className="nav-button website-logo" onClick={() => handleNavigation('/homepage')}>
        Mewsic
      </button>
      <div className="nav-options">
        <button className="nav-button" onClick={() => handleNavigation('/my-accounts')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/646/646395.png"} alt="Settings" className="nav-icon" />
          <span className="nav-button-text">Accounts</span>
        </button>
        <button className="nav-button" onClick={() => handleNavigation('/profile')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/1144/1144760.png"} alt="Profile" className="nav-icon" />
          <span className="nav-button-text">Profile</span>
        </button>
        <button className="nav-button" onClick={() => handleNavigation('/settings')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/4044/4044064.png"} alt="Settings" className="nav-icon" />
          <span className="nav-button-text">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
