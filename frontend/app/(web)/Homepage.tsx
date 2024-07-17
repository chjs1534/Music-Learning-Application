import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import NavBar from './NavBar';
import '../styles/website.css';
import { StringLiteral } from 'typescript';

const Homepage: React.FC = () => {
    // const location = useLocation();
    // const authToken = location.state?.authToken;
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => {
        setToken(localStorage.getItem('token'));
        setUserId(localStorage.getItem('id'));
      }, []);
    
    const clickMe = async () => {
        console.log('authToken:', token);
        console.log('userId:', userId);

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