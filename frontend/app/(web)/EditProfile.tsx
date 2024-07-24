import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/website.css';
import NavBar from './NavBar';

const EditProfile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImageURL, setProfileImageURL] = useState<string>('https://cdn-icons-png.flaticon.com/128/847/847969.png');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode === 'enabled') {
          setIsDarkMode(true);
          document.body.classList.add('dark-mode');
        } else {
          setIsDarkMode(false);
          document.body.classList.remove('dark-mode');
        }
        setToken(localStorage.getItem('token'));
    }, []);

    useEffect(() => {
        if (token) {
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
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setUsername(data.username);
                // Set profile image URL from user data if available
                if (data.profileImageURL) {
                    setProfileImageURL(data.profileImageURL);
                }
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'first-name') setFirstName(value);
        if (id === 'last-name') setLastName(value);
        if (id === 'username') setUsername(value);
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

    const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setProfileImageURL(URL.createObjectURL(file));
        }
    };

    const handleProfileImageClick = () => {
        document.getElementById('profile-image-input')?.click();
    };

    const goToProfile = () => {
        const queryParams = new URLSearchParams();
        window.location.href = `/profile/${id}?${queryParams.toString()}`;
    };

    const submitEditProfile = () => {
        const queryParams = new URLSearchParams();
        window.location.href = `/profile/${id}?${queryParams.toString()}`;
    };

    return (
        <div className="homepage">
            <NavBar />
            <div className="edit-profile">
                <div className="profile-header">
                    <div className="profile-image-container" onClick={handleProfileImageClick}>
                        <img src={profileImageURL} alt="Profile" className="profile-icon" />
                        <div className="profile-image-overlay">
                            <img src="https://cdn-icons-png.flaticon.com/128/685/685655.png" alt="Edit" className="camera-icon" />
                        </div>
                        <input
                            type="file"
                            id="profile-image-input"
                            className="profile-image-input"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                        />
                    </div>
                </div>
                {user ? (
                    <div className="profile-content">
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
                                id="first-name"
                                value={firstName}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                            <label htmlFor="first-name">First Name</label>
                        </div>
                        <div className="input-container">
                            <input
                                className="form-inputs"
                                placeholder=""
                                type="text"
                                id="last-name"
                                value={lastName}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                            <label htmlFor="last-name">Last Name</label>
                        </div>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
                <div className="button-container">
                    <button onClick={goToProfile} className="cancel-button">Cancel</button>
                    <button onClick={submitEditProfile} className="save-button">Save Changes</button>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
