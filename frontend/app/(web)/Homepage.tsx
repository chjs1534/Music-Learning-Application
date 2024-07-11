import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import NavBar from './NavBar';
import '../styles/website.css';

const Homepage: React.FC = () => {
    const location = useLocation();
    const authToken = location.state?.authToken;
    const token = `Bearer ${encodeURIComponent(authToken || '')}`;
    
    const clickMe = async () => {
        console.log('authToken:', authToken);

        await fetch('https://x5yhk546p1.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage2/hello', {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ testId: 'Adam' }),
        })
            .then(response => {
                console.log('Success IMKIDIDNG HAAHBHAAHAH stop its not funny acutally');
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
            })
            .catch(error => {
                console.error('Error:', error.message, error.code || error);
            });
    };

    return (
        <div className="homepage">
            <div className="dashboard">
                <NavBar />
                Welcome to the Homepage!
                <button onClick={clickMe}>click me!</button>
            </div>
        </div>
    )
}

export default Homepage