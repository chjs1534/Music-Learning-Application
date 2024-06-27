import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { USERPOOL_ID, CLIENT_ID } from '@env';

export const logout = () => {
    const poolData = {
        UserPoolId: USERPOOL_ID,
        ClientId: CLIENT_ID,
      };

    const UserPool = new CognitoUserPool(poolData);

    const user = UserPool.getCurrentUser();
    user.signOut();
    window.location.href = '/login'
}

const NavBar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="navbar">
      <button className="nav-button" onClick={() => handleNavigation('/mewsic')}>Mewsic</button>
      <button className="nav-button" onClick={() => handleNavigation('/profile')}>Profile</button>
      <button className="nav-button" onClick={() => handleNavigation('/settings')}>Settings</button>
      <button className="nav-button" onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default NavBar;