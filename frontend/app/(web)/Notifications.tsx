import React, { useState } from 'react'
import NavBar from './NavBar';
import '../styles/website.css';
import Request from '../../components/Request';

const Notifications = ({ id }) => {
    const [requests, setRequests] = useState("");

    // fetch requests
    return (
        <div className="homepage">
          <div className="profile">
            <NavBar id={id}/>
            <div className="all-requests">
                <Request />
            </div>
            
            
          </div>
        </div>
      )
}

export default Notifications
