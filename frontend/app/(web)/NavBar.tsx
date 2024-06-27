import profile from "../assets/profile.png"
import profile1 from "./profile.png"
import profile2 from "../assets/web/profile.png"
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { USERPOOL_ID, CLIENT_ID } from '@env';

const profileImage = require('./profile.png');

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
    console.log(profile1, profile2, profile, profileImage)
  };

  return (
    <div className="navbar">
      <button className="nav-button" onClick={() => handleNavigation('/homepage')}>Mewsic 🎵</button>
      <button className="nav-button" onClick={() => handleNavigation('/profile')}>
        <img src={"../assets/web/profile.png"} alt="Profile" className="nav-icon" id="profile-button" />
        <img src={profile1} alt="Profile" className="nav-icon" id="profile-button1" />
        <img src={profile2} alt="Profile" className="nav-icon" id="profile-button2" />
      </button>
      <button className="nav-button" onClick={() => handleNavigation('/settings')}>Settings</button>
      <button className="nav-button" onClick={() => logout()}>Logout</button>
      <img src={profileImage} alt="Profile" className="nav-icon" id="profile-button2" />
    </div>
  );
};

export default NavBar;
