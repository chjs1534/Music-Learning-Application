import React, { useState, useEffect } from 'react'
import '../app/styles/website.css';

interface RequestProps {
  id: string;
  token: string;
  onAction: () => void;
}

const Request: React.FC<RequestProps> = ({ id, token, onAction }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getDetails();
  }, []);

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


  // have to add logic for when the buttons are pressed
  const acceptRequest = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/addMatch`, {
      method: 'POST',
      body: JSON.stringify({
        'userId1': id,
        'userId2': localStorage.getItem('id'),
      }),
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
        onAction();
        console.log('Success123:', data);
        setUser(data);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }
  


  const denyRequest = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/removeMatch`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId1: id,
        userId2: localStorage.getItem('id')
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
        <button className="request-button" onClick={acceptRequest}>
            accept request
        </button>
        <button className="request-button" onClick={denyRequest}>
            deny request
        </button>
      </div>
    </div>
  )
}

export default Request