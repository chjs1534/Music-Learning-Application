import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/website.css';
import NavBar from './NavBar';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const { id } = useParams();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (token) {
      console.log(token, id)
      getDetails();
    }
  }, [token]);

  const getDetails = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token!,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const goToEditProfile = () => {
    const queryParams = new URLSearchParams();
    window.location.href = `/edit-profile/${id}?${queryParams.toString()}`;
  };

  const handleRequest = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/addRequest`, {
      method: 'POST',
      body: JSON.stringify({
        'userId1': localStorage.getItem('id'),
        'userId2': id,
      }),
      headers: {
        'Authorization': token!,
        'Content-Type': 'application/json',
      },
    })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  return (
    <div className="homepage">
      <NavBar />
      <div className="profile">
        <div className="profile-header">
          <img src="https://cdn-icons-png.flaticon.com/128/847/847969.png" alt="Profile" className="profile-icon" />
        </div>
        {user && (
          <div className="profile-content">
            <div className="profile-details">
              <p>{user.firstName} {user.lastName}</p>
              <p>@{user.username}</p>
            </div>
            <div className="profile-actions">
              {id === localStorage.getItem('id') ? (
                <button className="edit-profile-button">
                  <img onClick={goToEditProfile} src="https://cdn-icons-png.flaticon.com/128/860/860814.png" alt="Edit Profile" className="edit-profile-button" />
                </button>
              ) : (
                <button className="request-button" onClick={handleRequest}>Request</button>
              )}
            </div>
          </div>
        )}
        <div className="profile-extra">
          <h2>Teacher Details</h2>
          <p>heloolhelho, this is detail</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
