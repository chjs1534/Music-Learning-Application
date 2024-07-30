import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/website.css';
import NavBar from './NavBar';
import StudentCard from '../../components/StudentCard';
import VideoCard from '../../components/VideoCard';

const Profile: React.FC = () => {
  const [userType, setUserType] = useState<string>();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string>();
  const [matched, setMatched] = useState<boolean>(false);
  const [subAccounts, setSubAccounts] = useState();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [videos, setVideos] = useState();
  const [thumbnail, setThumbnail] = useState();

  const { id } = useParams();

  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  // use effect that calls when id is changed
  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setUserType(localStorage.getItem('userType'));
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'enabled') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
    console.log("Mode:" + storedDarkMode)
  }, []);

  useEffect(() => {
    if (token && id) {
      getDetails();
    }
  }, [id, token]);

  useEffect(() => {
    if (user !== null) {
      getMyTeachers();
    }
  }, [user]);

  useEffect(() => {
    if (user !== null) {
      getSubAccounts();
    }
  }, [user]);

  useEffect(() => {
    getVideos();
    

  }, [user]);

  useEffect(() => {
    if (videos != null) {
      videos.map(id => {
        console.log(id)
      })
    }
  }, [videos]);

  

  const viewMatch = () => {
    navigate(`/viewmatches/${id}`);
  }

  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current === e.target) {
      setShowModal(false);
    }
  };

  const unmatch = async () => {
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
    }).then(() => {
      alert("unmacthed")
      window.location.reload();
    }).catch(error => {
      console.error('Error:', error.message, error.code || error);
    });
  }

  const getDetails = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
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
        console.log(data)
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const goToEditProfile = () => {
    const queryParams = new URLSearchParams();
    window.location.href = `/edit-profile/${id}?${queryParams.toString()}`;
  };


  const handleRequest = async (accId) => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/addRequest`, {
      method: 'POST',
      body: JSON.stringify({
        'userId1': accId,
        'userId2': id,
      }),
      headers: {
        'Authorization': token!,
        'Content-Type': 'application/json',
      },
    }).then(() => {
      alert("request sent")
      setShowModal(false);
    })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const getMyTeachers = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/getMatches/${id}`, {
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
        // check if the teachers id is in the kids teachers list
        for (let i = 0; i < data.matches.length; i++) {
          if (data.matches[i].userId === localStorage.getItem('id')) {
            setMatched(true);
            console.log("matched")
          }
        }
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  const getSubAccounts = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getFamily/${localStorage.getItem('id')}`, {
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
      setSubAccounts(data.Items);
    })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  const getVideos = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/videos?userId=${id}`, {
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
      console.log(data, "videos setting")
      setVideos(data.fileIds);
    })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }



  // cases

  // teacher view own, student

  // parent views own, child, teacher
  // child will have button to view their matches 
  // teacher willl have button to request a match
  // student views own, teacher
  // teacher will have requst match button

  const renderContent = () => {
    if (id === localStorage.getItem('id')) {
      return (
        <img onClick={goToEditProfile} src="https://cdn-icons-png.flaticon.com/128/860/860814.png" alt="Edit Profile" className="edit-profile-button" />
      );
    } else if (user !== null) {
      if (userType === "Student" && user.userType === "Teacher") {
        if (matched === false) {
          return (<button onClick={() => handleRequest(localStorage.getItem('id'))}>request</button>);
        } else {
          // unmatch student and teacher if already matched
          return (<button onClick={unmatch}>unmatch</button>);
        }
      } else if (userType === "Parent" && user.userType === "Teacher") {
        // request match have modal for kids
        console.log(subAccounts)
        return (<button className="request-button" onClick={() => setShowModal(true)}>request match</button>);
      } else if (user.userType === "Child") {
        // navigate view matches/ id
        return (<button onClick={viewMatch}>view matches</button>);
      } else if (user.userType === "Student") {
        return;
      }
    }
  }

  const handleThumbnailClick = (fileId) => {
    navigate(`/video/${id}/${fileId}`)
  }

  return (
    <div className="homepage">
      <div className="profile">
        <NavBar />
        <div className="profile-details">
          {showModal && (
            <div className="modal" ref={modalRef} onClick={handleCloseModal}>
              <div className="modal-content">
                <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                For which Child?
                <div className="modal-accounts-div">
                  {subAccounts && subAccounts.length > 0 ? (
                    subAccounts.map(acc => (
                      <StudentCard
                        id={acc.userId}
                        token={token}
                        handleClick={handleRequest}
                      />
                    ))
                  ) : null}
                </div>
              </div>
            </div>
          )}
          <div className="pfp">
            {user && <img src={"https://cdn-icons-png.flaticon.com/128/847/847969.png"} alt="Profile" className="profile-icon" />}
          </div>
          {user && <div className="profiledeets">
            <p className="profileName">Name : {user.firstName} {user.lastName}</p>
            <p className="profileUserName">@{user.username}</p>
            <p className="aboutme">About Me:</p>
            <p className="aboutme">User Type: {user.userType}</p>
          </div>}
          <div>{renderContent()}</div>
        </div>
        {/* {user && (
          <div className="profile-content">
            <div className="profile-details">
              <p>{user.firstName} {user.lastName}</p>
              <p>@{user.username}</p>
            </div>
            <div className="profile-actions">
              {id === localStorage.getItem('id') ? (
                <button className="edit-profile-button">
                  <img onClick={goToEditProfile} src="https://cdn-icons-png.flaticon.com/128/860/860814.png" alt="Edit Profile" className="edit-profile-button" />
                </button>
              ) : (
                <button className="request-button" onClick={handleRequest}>Request</button>
              )}
            </div>
          </div>
        )} */}
        {/* <div className="profile-extra">
          <h2>Extra Details</h2>
          <p>Details here...</p>
        </div> */}
        {user && user.userType === "Student" && <div className="profile-extra">
          <h2>Videos</h2>
          <div className="profile-videos">
            {(videos && videos.length > 0) ? videos.map(qwe => (
              <VideoCard key={qwe} id={id} fileId={qwe} token={token} handlePress={() => handleThumbnailClick(qwe)} web={true}/>
            )         
            ): <p>hi</p>}
          </div>
          
        </div>}
        
      </div>
    </div>
  );
};

export default Profile;
