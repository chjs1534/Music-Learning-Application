import React from 'react'
import '../styles/website.css';
import NavBar from './NavBar';

const Profile: React.FC = () => {
  return (
    <div className="homepage">
      <div className="profile">
        <NavBar />
        heree is your profile {':)'}
      </div>
    </div>
  )
}

export default Profile