import React, { useState, useEffect } from 'react';
import '../styles/website.css';
import NavBar from './NavBar';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';

const UserPool = new CognitoUserPool(poolData);

export const logout = (): void => {
  const user: CognitoUser | null = UserPool.getCurrentUser();
  if (user) {
    user.signOut();
    localStorage.clear();
  }
  window.location.href = '/login';
};

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setuserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize dark mode state from local storage
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

  const handleEditProfile = () => {
    const queryParams = new URLSearchParams();
    window.location.href = `/edit-profile/${userId}?${queryParams.toString()}`;
  };

  return (
    <div className={`homepage ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="settings">
        <NavBar />

        <div className="settings-profile">
          <h2>Profile</h2>
          <button className="edit-profile-button" onClick={handleEditProfile}>
            <img src={"https://cdn-icons-png.flaticon.com/128/860/860814.png"} alt="Edit Profile" className="nav-icon" />
          </button>
        </div>

        <div className="settings-theme">
        <h2>Theme</h2>
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

        <div className="settings-account">
        <h2>Account</h2>
          <button className="logout-button" onClick={() => logout()}>
            <span>Log Out</span><img src={"https://cdn-icons-png.flaticon.com/128/1828/1828427.png"} alt="Log Out" className="nav-icon" />
          </button>
          <button className="logout-button" onClick={() => logout()}>
            <span>Delete Account</span><img src={"https://cdn-icons-png.flaticon.com/128/14360/14360493.png"} alt="Log Out" className="nav-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings;
