import React from 'react'
import '../styles/website.css';
import NavBar from './NavBar';

const Profile: React.FC = () => {
  // const [userType, setUserType] = useState<string>('Techer');
  return (
    <div className="homepage">
      <div className="profile">
        <NavBar />
        <div className="details-container">
          <div className="pfp">
            <h2 className="profileword">Profile</h2>
            <img src={"https://cdn-icons-png.flaticon.com/128/5653/5653986.png"} alt="Teachers" className="pfp-icon" />
          </div>
          <div className="profiledeets">
              <p className="profileName">name</p>
              <p className="profileUserName">username</p>
              <p className="aboutme">aboutme</p>
          </div>
          <div className="editprofile">
            <img src={"https://cdn-icons-png.flaticon.com/128/860/860814.png"} alt="Teachers" className="editprofilebutton" />
          </div>
        </div>
        <div className="details-container2">
          <h2 className="profileword">Teacher Details</h2>
          <p>heloolhelho</p>
        </div>
      </div>
      
    </div>
  )
}

export default Profile