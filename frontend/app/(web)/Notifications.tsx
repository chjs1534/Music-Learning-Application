import React, { useState, useEffect } from 'react'
import NavBar from './NavBar';
import '../styles/website.css';
import Request from '../../components/Request';

const Notifications = () => {
    const [requests, setRequests] = useState();
    const [id, setId] = useState<string>();
    const [token, setToken] = useState<string>();

    // fetch requests and map them /match/getRequests/{userId}
    useEffect(() => {
      setId(localStorage.getItem('id'))
      setToken(localStorage.getItem('token'))
    }, []);

    useEffect(() => {
      getRequests();
    }, [id, token]);
    

    const getRequests = async () => {
      await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/getRequests/${id}`, {
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
          setRequests(data);
        })
        .catch(error => {
          console.error('Error:', error.message, error.code || error);
        });
    }

    return (
        <div className="homepage">
          <div className="profile">
            <NavBar />
            <div className="all-requests">
                {requests && requests.requests.length > 0 ? (requests.requests.map(request => (
                  <Request 
                    id={request.userId}
                    token={token}
                  />
                ))) : <p>No requests</p>
              }
            </div>
            
            
          </div>
        </div>
      )
}

export default Notifications
