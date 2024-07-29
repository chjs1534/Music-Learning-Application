import React, { useState, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';
import '../styles/auth.css';
import '../styles/fonts.css';


const UserPool = new CognitoUserPool(poolData);

const NavBar: React.FC = () => {
  const [userType, setUserType] = useState<string>();
  const [id, setId] = useState<string>();
  const [authToken, setAuthToken] = useState<string>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setAuthToken(localStorage.getItem('token'));
    setUserType(localStorage.getItem('userType'));
    setId(localStorage.getItem('id'));
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'enabled') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const handleNavigation = (path: string): void => {
    console.log(authToken, userType, id);
    const queryParams = new URLSearchParams();
    window.location.href = `${path}?${queryParams.toString()}`;
  };

  const renderContent = () => {
    if (userType === "Teacher") {
      return (
        <button className="nav-button" onClick={() => handleNavigation('/students')}>
          {/* <img src="https://cdn-icons-png.flaticon.com/128/9316/9316744.png" alt="Students" className="nav-icon" /> */}
          <span className="nav-button-text">My Students</span>
        </button>
      );
    } else if (userType === "Student") {
      return (
        <>
          <button className="nav-button" onClick={() => handleNavigation('/sheet-music')}>
            {/* <img src="https://cdn-icons-png.flaticon.com/128/10455/10455354.png" alt="Teachers" className="nav-icon" /> */}
            <span className="nav-button-text">Sheet Music</span>
          </button><button className="nav-button" onClick={() => handleNavigation('/teachers')}>
            {/* <img src="https://cdn-icons-png.flaticon.com/128/10455/10455354.png" alt="Teachers" className="nav-icon" /> */}
            <span className="nav-button-text">My Teachers</span>
          </button>
        </>
      );
    } else if (userType === "Parent") {
      return (
        <>
          <button className="nav-button" onClick={() => handleNavigation('/teachers')}>
            {/* <img src="https://cdn-icons-png.flaticon.com/128/10455/10455354.png" alt="Teachers" className="nav-icon" /> */}
            <span className="nav-button-text">My Teachers</span>
          </button>
          <button className="nav-button" onClick={() => handleNavigation('/my-accounts')}>
            {/* <img src="https://cdn-icons-png.flaticon.com/128/646/646395.png" alt="Accounts" className="nav-icon" /> */}
            <span className="nav-button-text">My Accounts</span>
          </button>
        </>
      );
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <button className="nav-button" onClick={() => handleNavigation('/homepage')}>
        <span className="website-logo">Mewsic</span>
      </button>
      <div className={`nav-options ${isMenuOpen ? 'open' : ''}`}>
        {renderContent()}
        <button title="Messages" className="nav-button" onClick={() => handleNavigation('/message')}>
          <img src="https://cdn-icons-png.flaticon.com/128/542/542638.png" alt="Message" className="nav-icon" />
          {/* <span className="nav-button-text">Message</span> */}
        </button>
        <button title="Notifications" className="nav-button" onClick={() => handleNavigation('/notifications')}>
          <img src="https://cdn-icons-png.flaticon.com/128/2529/2529521.png" alt="Notifications" className="nav-icon" />
          {/* <span className="nav-button-text">Notifications</span> */}
        </button>
        <button title="My Profile" className="nav-button" onClick={() => handleNavigation(`/profile/${id}`)}>
          <img src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png" alt="Profile" className="nav-icon" />
          {/* <span className="nav-button-text">Profile</span> */}
        </button>
        <button title="Settings" className="nav-button" onClick={() => handleNavigation('/settings')}>
          <img src="https://cdn-icons-png.flaticon.com/128/2099/2099058.png" alt="Settings" className="nav-icon" />
          {/* <span className="nav-button-text">Settings</span> */}
        </button>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
    </nav>
  );
};

export default NavBar;
