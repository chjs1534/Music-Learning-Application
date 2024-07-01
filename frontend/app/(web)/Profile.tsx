import React from 'react'
import '../styles/website.css';
import NavBar from './NavBar';

const Profile: React.FC = () => {
  return (
    <div className="homepage">
            <NavBar />
            <div className="profile">
                heree is your profile {':)'}
            </div>
        </div>
  )
}

export default Profile