import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import '../styles/website.css';
import NavBar from './NavBar';

const Profile: React.FC = () => {
  // const [userType, setUserType] = useState<string>('Techer');
  const [user, setUser] = useState<string>(null);
  const [token, setToken] = useState<string>();

  const { id } = useParams();
  console.log("asd", id)

  useEffect(() => {
    (async () => {
      await setToken(localStorage.getItem('token'))
    })();
    getDetails();
  }, []);

  // fetch user using id
  const getDetails = async () => {
    console.log("asdadadsasdaddad", token)
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

  const handleRequest = async () => {
    console.log(localStorage.getItem('id'), id)
    
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/addRequest`, {
      method: 'POST',
      body: JSON.stringify({
        'userId1': localStorage.getItem('id'),
        'userId2': id,
      }),
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
    })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  return (
    <div className="homepage">
      <div className="profile">
        <NavBar />
        <div className="details-container">
          <div className="pfp">
            <h2 className="profileword">Profile</h2>
            <img src={"https://cdn-icons-png.flaticon.com/128/5653/5653986.png"} alt="Teachers" className="pfp-icon" />
          </div>
          {user && <div className="profiledeets">
            <p className="profileName">{user.firstName} {user.lastName}</p>
            <p className="profileUserName">{user.username}</p>
            <p className="aboutme">aboutme</p>
          </div>}
          {id === localStorage.getItem('id') ? <div className="editprofile">
            <img src={"https://cdn-icons-png.flaticon.com/128/860/860814.png"} alt="Teachers" className="editprofilebutton" />
          </div>
          : <button onClick={handleRequest}>rrquest</button>}
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