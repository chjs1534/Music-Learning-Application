import React, { useState, useEffect } from 'react';
import '../styles/settingStyles.css';
import NavBar from './NavBar';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';

const UserPool = new CognitoUserPool(poolData);

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [authToken, setToken] = useState<string | null>(null);
  const [userId, setuserId] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setuserId(localStorage.getItem('id'));
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'enabled') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const logout = (): void => {
    const user: CognitoUser | null = UserPool.getCurrentUser();
    if (user) {
      user.signOut();
      localStorage.clear();
    }
    window.location.href = '/login';
  };

  const deleteAccount = async () => {
    logout();
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/deleteUser/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
    }).then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    }).catch(error => {
      console.error('Error:', error.message, error.code || error);
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    if (!isDarkMode) {
      localStorage.setItem('darkMode', 'enabled');
      document.body.classList.add('dark-mode');
    } else {
      localStorage.setItem('darkMode', 'disabled');
      document.body.classList.remove('dark-mode');
    }
  };

  const handleEditProfile = () => {
    const queryParams = new URLSearchParams();
    window.location.href = `/edit-profile/${userId}?${queryParams.toString()}`;
  };

  return (
    <div className={`homepage ${isDarkMode ? 'dark-mode' : ''}`}>
      <NavBar />
      <div className="settings">
        <div className="settings-container">
          <div className="settings-profile">
            <h2>Profile</h2>
            <button className="settings-button edit-profile-button" onClick={handleEditProfile}>
              <span>Edit Profile</span>
              <img src={"https://cdn-icons-png.flaticon.com/128/860/860814.png"} alt="Edit Profile" className="nav-icon" />
            </button>
          </div>

          <div className="settings-theme">
            <h2>Theme</h2>
            <div className="dark-mode-toggle">
              <label htmlFor="darkModeSwitch">Dark Mode</label>
              <div className="switch">
                <input
                  type="checkbox"
                  id="darkModeSwitch"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <span className="slider"></span>
              </div>
            </div>
          </div>

          <div className="settings-account">
            <h2>Account</h2>
            <button className="settings-button logout-button" onClick={logout}>
              <span>Log Out</span>
              <img src={"https://cdn-icons-png.flaticon.com/128/1828/1828427.png"} alt="Log Out" className="nav-icon" />
            </button>
            <button className="settings-button delete-account-button" onClick={deleteAccount}>
              <span>Delete Account</span>
              <img src={"https://cdn-icons-png.flaticon.com/128/14360/14360493.png"} alt="Delete Account" className="nav-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
