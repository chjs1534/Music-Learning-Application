import React from 'react'
import '../styles/website.css';
import NavBar from './NavBar';

const Settings: React.FC = () => {
  return (
    <div className="homepage">
            <NavBar />
            <div className="settings">
                Settings time
            </div>
        </div>
  )
}

export default Settings