import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../styles/myAccountStyles.css';
import NavBar from './NavBar';
import { poolData } from '../config/poolData';
import StudentCard from '../../components/StudentCard';
import { useNavigate } from 'react-router-dom';

const UserPool = new CognitoUserPool(poolData);

interface AccountDetails {
    username: string;
}


const MyAccounts: React.FC = () => {
    const [userType, setUserType] = useState<string>();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
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
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [initialized, setInitialized] = useState(false);  // New state to control execution order

    const modalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve data from localStorage and set initial states
        setToken(localStorage.getItem('token'));
        setId(localStorage.getItem('id'));
        setUserType(localStorage.getItem('userType'));
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode === 'enabled') {
            setIsDarkMode(true);
            document.body.classList.add('dark-mode');
        } else {
            setIsDarkMode(false);
            document.body.classList.remove('dark-mode');
        }
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (initialized) {
            console.log(token);
            getEmail();
            getMyAccounts();
        }
    }, [initialized, id, token]);

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

    const authenticate = async () => {
        let jwtToken;
        let userId;
        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });
        const userData = {
            Username: username,
            Pool: UserPool
        };
        const cognitoUser = new CognitoUser(userData);
        await new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    jwtToken = result.idToken.jwtToken;
                    const jwtPayload = JSON.parse(atob(jwtToken.split('.')[1]));
                    userId = jwtPayload.sub;
                    setAccounts(prevAccounts => [...prevAccounts, { username }]);
                    setUsername('');
                    setFirstname('');
                    setLastname('');
                    setPassword('');
                    setConfirmPassword('');
                    setShowModal(false);
                    setErrorMessage('');
                    resolve();
                },
                onFailure: function (err) {
                    reject(err);
                },
            });
        });
    }

    const getEmail = async () => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            if (!response.ok) {
                console.log(id)
                return response.text().then(text => { throw new Error(text) });
            }
            else {
                console.log(response);
            }
            return response.json();
        })
            .then(data => {
                setEmail(data.email);
                console.log(data.email);
            })
    }

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

        console.log(email, "hi")

        const attributeList = [];
        const attributeEmail = new CognitoUserAttribute({
            Name: 'email',
            Value: email
        });
        const attributeUsername = new CognitoUserAttribute({
            Name: 'custom:username',
            Value: username
        });
        const attributeUserType = new CognitoUserAttribute({
            Name: 'custom:userType',
            Value: 'Child'
        });
        const attributeFirstName = new CognitoUserAttribute({
            Name: 'custom:firstName',
            Value: firstname
        });
        const attributeLastName = new CognitoUserAttribute({
            Name: 'custom:lastName',
            Value: lastname
        });

        attributeList.push(attributeEmail);
        attributeList.push(attributeUsername);
        attributeList.push(attributeUserType);
        attributeList.push(attributeFirstName);
        attributeList.push(attributeLastName);

        const result = await new Promise((resolve, reject) => {
            UserPool.signUp(username, password, attributeList, null, (err, result) => {
                if (err) {
                    console.error(err);
                }
                else {
                    authenticate();
                    window.location.reload();
                }
                resolve(result);
            });
        });
    };

    const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current === e.target) {
            setShowModal(false);
        }
    };

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
            setSubAccounts(data.users);
        })
            .catch(error => {
                console.error('Error:', error.message, error.code || error);
            });
    }

    const handleClick = (accountId) => {
        navigate(`/profile/${accountId}`);
    }

    return (
        <div className="homepage">
            <NavBar />
            <div className="my-accounts">
                <h2>My Accounts</h2>
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
                <div className="accounts">
                    {subAccounts && subAccounts.length > 0 ? (subAccounts.map(acc => (
                        <StudentCard
                            id={acc.userId}
                            token={token}
                            handleClick={handleClick}
                        />
                    ))) : null}
                </div>
            </div>
            <button className="create-account-button" onClick={() => setShowModal(true)}>Create Account</button>
        </div>
    );
};

export default MyAccounts;
