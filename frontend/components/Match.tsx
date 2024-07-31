import React, { useState, useEffect } from 'react'
import '../app/styles/website.css';
import { useNavigate } from 'react-router-dom';

interface MatchProps {
  childId: string;
  teacherId: string;
  token: string;
  onAction: () => void;
}

const Match: React.FC<MatchProps> = ({ childId, teacherId, token, onAction }) => {
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${teacherId}`, {
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

  const viewProfile = () => {
    navigate(`/profile/${teacherId}`);
  }
  
  const denyRequest = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/removeMatch`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId1: childId,
        userId2: teacherId
      }),
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
        onAction();
        console.log('Success098:', data);
        setUser(data);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  return (
    <div className='request-container'>
      <div className="pfp-name-container">
      <img src="https://cdn-icons-png.flaticon.com/128/5653/5653986.png" alt={"teacher ad"}  className="teacher-pfp"/>
      {user && <p>{user.firstName + " " + user.lastName}</p>}
      </div>
      <div className="request-button-container">
        <button className="request-button" onClick={viewProfile}>
            view profile
        </button>
        <button className="request-button" onClick={denyRequest}>
            unmatch
        </button>
      </div>
    </div>
  )
}

export default Match;