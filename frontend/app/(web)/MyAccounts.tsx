import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../styles/website.css';
import NavBar from './NavBar';
import { mobilePoolData } from '../config/poolData';
import StudentCard from '../../components/StudentCard';

const UserPool = new CognitoUserPool(mobilePoolData);

interface AccountDetails {
    username: string;
}


const MyAccounts: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [accounts, setAccounts] = useState<AccountDetails[]>([]);
    const [subAccounts, setSubAccounts] = useState();
    const [token, setToken] = useState<string>();
    const [id, setId] = useState<string>();

    const modalRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'username') setUsername(value);
        if (id === 'firstname') setFirstname(value);
        if (id === 'lastname') setLastname(value);
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
        const dataUsername = { Name: 'username', Value: username };
        const attributeUsername = new CognitoUserAttribute(dataUsername);

        attributeList.push(attributeUsername);

        UserPool.signUp(username, password, attributeList, null, (err, result) => {
            if (err) {
                setErrorMessage(err.message || JSON.stringify(err));
                return;
            } else {
                setAccounts(prevAccounts => [...prevAccounts, { username }]);
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                setShowModal(false);
                setErrorMessage('');
            }
        });

        await fetch('https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/addUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: id,
              email: "",
              username: username,
              userType: "Child",
              firstName: firstname,
              lastName: lastname
            }),
          })
            .then(response => {
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

    const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current === e.target) {
            // setShowModal(false);
            // setUsername('');
            // setPassword('');
            // setConfirmPassword('');
            // setErrorMessage('');
            console.log("handleCloseModal if click outside to close")
        }
    };

    const handleViewProfile = (username: string) => {
        console.log(`View profile for ${username}`);
    };

    const handleEditProfile = (username: string) => {
        console.log(`Edit profile for ${username}`);
    };

    const handleDeleteProfile = (username: string) => {
        console.log(`Delete profile for ${username}`);
    };

    useEffect(() => {
        setToken(localStorage.getItem('token'));
        setId(localStorage.getItem('id'));
    }, []);

    useEffect(() => {
        getMyAccounts();
    }, [id, token]);

    useEffect(() => {
        console.log(subAccounts)
    }, [subAccounts]);

    const getMyAccounts = async () => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getFamily/${id}`, {
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
        }).then(data => {
            console.log("oo", data.Items);
            setSubAccounts(data.Items);
        })
        .catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
    }

    return (
        <div className="homepage">
            <NavBar />
            <div className="my-accounts">
                <button className="button1" onClick={() => setShowModal(true)}>Create Account</button>
                {showModal && (
                    <div className="modal" ref={modalRef} onClick={handleCloseModal}>
                        <div className="modal-content">
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                            Register for mobile app account!
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
                            <div className="input-container">
                                <input
                                    className="form-inputs"
                                    placeholder=""
                                    type="text"
                                    id="firstname"
                                    value={firstname}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                                <label htmlFor="username">First Name</label>
                            </div>
                            <div className="input-container">
                                <input
                                    className="form-inputs"
                                    placeholder=""
                                    type="text"
                                    id="lastname"
                                    value={lastname}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                                <label htmlFor="username">Last Name</label>
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
                )}
                {accounts.map((account, index) => (
                    <div key={index} className="account-details">
                        <p>Username: {account.username}</p>
                        <div>
                            <button className="button1" onClick={() => handleViewProfile(account.username)}>View Profile</button>
                            <button className="button1" onClick={() => handleEditProfile(account.username)}>Edit Profile</button>
                            <button className="button1" onClick={() => handleDeleteProfile(account.username)}>Delete Profile</button>
                        </div>
                    </div>
                ))}
                <div className="myteachers">
            {subAccounts && subAccounts.length > 0 ? (subAccounts.map(acc => (
              <StudentCard
                id={acc.userId}
                token={token}
              />
            ))) : null}
          </div>
            </div>
        </div>
    );
};

export default MyAccounts;
