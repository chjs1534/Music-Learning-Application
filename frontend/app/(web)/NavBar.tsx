import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import '../styles/fonts.css';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { USERPOOL_ID, CLIENT_ID } from '@env';

export const logout = () => {
  const poolData = {
    UserPoolId: USERPOOL_ID,
    ClientId: CLIENT_ID,
  };

  const UserPool = new CognitoUserPool(poolData);

  const user = UserPool.getCurrentUser();
  user.signOut();
  window.location.href = '/login';
};

const NavBar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="navbar">
      <button className="nav-button website-logo" onClick={() => handleNavigation('/homepage')}>
        Mewsic🎵
      </button>
      <div className="nav-icons">
        <button className="nav-button" onClick={() => handleNavigation('/profile')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/1144/1144760.png"} alt="Profile" className="nav-icon" />
        </button>
        <button className="nav-button" onClick={() => handleNavigation('/settings')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/3524/3524636.png"} alt="Settings" className="nav-icon" />
        </button>
        <button className="nav-button" onClick={() => logout()}>
          <img src={"https://cdn-icons-png.flaticon.com/128/1828/1828427.png"} alt="Log Out" className="nav-icon" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
