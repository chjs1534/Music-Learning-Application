import React, { useEffect, useState, ChangeEvent } from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../styles/website.css';
import NavBar from './NavBar';
import { mobilePoolData } from '../config/poolData';

const UserPool = new CognitoUserPool(mobilePoolData);

const MyAccounts: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'username') setUsername(value);
        if (id === 'password') setPassword(value);
        if (id === 'confirmPassword') setConfirmPassword(value);
    };

    const handleInputFocus = (e: ChangeEvent<HTMLInputElement>) => {
        const { id } = e.target;
        const label = document.querySelector(`label[for=${id}]`);
        if (label) {
            label.classList.add('active');
        }
    };

    const handleInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const label = document.querySelector(`label[for=${id}]`);
        if (label && !value) {
            label.classList.remove('active');
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const registerMobile = async () => {
        if (username.length < 3) {
            setErrorMessage("Username must be longer than 3 characters");
            return;
        }
        if (password.length < 8) {
            setErrorMessage("Password must be longer than 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        const attributeList: CognitoUserAttribute[] = [];

        const dataUsername = {
            Name: 'username',
            Value: username
        };

        // const dataPassword = {
        //     Name: 'password',
        //     Value: password
        // };

        const attributeUsername = new CognitoUserAttribute(dataUsername);
        // const attributePassword = new CognitoUserAttribute(dataPassword);

        attributeList.push(attributeUsername);
        // attributeList.push(attributePassword);

        UserPool.signUp(username, password, attributeList, null, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
                // navigate('/verification', { state: { email, password } });
                // window.location.href = '/verification', { state: { username, password } };
            }
        });
    };

    return (
        <div className="homepage">
            <div className="profile">
                <NavBar />
                <div className="input-container">
                    <input
                        className="form-inputs"
                        placeholder=""
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    <label htmlFor="username">Username</label>
                </div>
                <div className="input-container password-container">
                    <input
                        className="form-inputs"
                        placeholder=""
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    <label htmlFor="password">Password</label>
                    <img
                        src={passwordVisible ? "https://cdn-icons-png.flaticon.com/128/2767/2767146.png" : "https://cdn-icons-png.flaticon.com/128/709/709612.png"}
                        alt={passwordVisible ? "Hide password" : "Show password"}
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                    />
                </div>
                <div className="input-container password-container">
                    <input
                        className="form-inputs"
                        placeholder=""
                        type={confirmPasswordVisible ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <img
                        src={confirmPasswordVisible ? "https://cdn-icons-png.flaticon.com/128/2767/2767146.png" : "https://cdn-icons-png.flaticon.com/128/709/709612.png"}
                        alt={confirmPasswordVisible ? "Hide password" : "Show password"}
                        className="password-toggle"
                        onClick={toggleConfirmPasswordVisibility}
                    />
                </div>
                <div className="error-message-container">
                    {errorMessage && <span className="error-message">{'*' + errorMessage}</span>}
                </div>
                <button className="button1" type="submit" onClick={registerMobile}>Register</button>
            </div>
        </div>
    )
}

export default MyAccounts

function setErrorMessage(arg0: string) {
    throw new Error('Function not implemented.');
}
