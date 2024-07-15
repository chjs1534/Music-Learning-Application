import React, { useState, useEffect } from 'react'
import '../styles/website.css';
import NavBar from './NavBar';


interface ProfileProps {
  id: string;
  token: string;
}

const Profile: React.FC<ProfileProps> = ({ id, token }) => {
  // const [userType, setUserType] = useState<string>('Techer');
  const [user, setUser] = useState<string>(null); 

  useEffect(() => {
    getDetails();
    console.log("xdd", token, id)
  }, []);

  // fetch user using id
  const getDetails = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
    }).then(response => {
      if (response.status === 204) {
        console.log('Success: No content returned from the server.');
        return;
      }
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      else {
        console.log(response);
      }
      return response.json();
    })
      .then(data => {
        console.log('Success:', data);
        setUser(data);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }



  return (
    <div className="homepage">
      <div className="profile">
        <NavBar id={id} />
        <div className="details-container">
          <div className="pfp">
            <h2 className="profileword">Profile</h2>
            <img src={"https://cdn-icons-png.flaticon.com/128/5653/5653986.png"} alt="Teachers" className="pfp-icon" />
          </div>
          <div className="profiledeets">
            <p className="profileName">{user.firstName} {user.lastName}</p>
            <p className="profileUserName">{user.username}</p>
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