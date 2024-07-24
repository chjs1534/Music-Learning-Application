import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import '../styles/fonts.css';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { poolData } from '../config/poolData';

const UserPool = new CognitoUserPool(poolData);

const NavBar: React.FC = () => {
  const [userType, setUserType] = useState<string>();
  const [id, setId] = useState<string>();
  const [authToken, setAuthToken] = useState<string>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // const navigate = useNavigate();

  // const handleNavigation = (path: string): void => {
  //   const currentPath = window.location.pathname;
  //   if (currentPath === path) {
  //     window.location.reload();
  //   } else {
  //     navigate(path);
  //   }
  // };

  useEffect(() => {
    setAuthToken(localStorage.getItem('token'))
    setUserType(localStorage.getItem('userType'))
    setId(localStorage.getItem('id'))
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
  useEffect(() => {
    console.log(userType)
  }, [userType]);

  const renderContent = () => {
    if (userType === "Teacher") {
      return (<button className="nav-button" onClick={() => handleNavigation('/students')}>
        <img src={"https://cdn-icons-png.flaticon.com/128/9316/9316744.png"} alt="Students" className="nav-icon" />
        <span className="nav-button-text">Students</span>
      </button>);
    } else if (userType === "Student") {
      return (<button className="nav-button" onClick={() => handleNavigation('/teachers')}>
        <img src={"https://cdn-icons-png.flaticon.com/128/10455/10455354.png"} alt="Teachers" className="nav-icon" />
        <span className="nav-button-text">Teachers</span>
      </button>);
    } else if (userType === "Parent") {
      return (<>
        <button className="nav-button" onClick={() => handleNavigation('/teachers')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/10455/10455354.png"} alt="Teachers" className="nav-icon" />
          <span className="nav-button-text">Teachers</span>
        </button>
        <button className="nav-button" onClick={() => handleNavigation('/my-accounts')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/646/646395.png"} alt="Accounts" className="nav-icon" />
          <span className="nav-button-text">Accounts</span>
        </button>
      </>);
    }
  }

  return (
    <div className="navbar">
      <button className="nav-button website-logo" onClick={() => handleNavigation('/homepage')}>
        Mewsic
      </button>
      <div className="nav-options">
        {renderContent()}
        <button className="nav-button" onClick={() => handleNavigation('/message')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/542/542638.png"} alt="Message" className="nav-icon" />
          <span className="nav-button-text">Message</span>
        </button>

        <button className="nav-button" onClick={() => handleNavigation('/notifications')}>
          <img src={"https://cdn-icons-png.flaticon.com/128/2529/2529521.png"} alt="Notifications" className="nav-icon" />
          <span className="nav-button-text">Notifications</span>
        </button>


        <button className="nav-button" onClick={() => handleNavigation(`/profile/${id}`)}>
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
