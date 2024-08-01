import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/profileStyles.css';
import NavBar from './NavBar';
import StudentCard from '../../components/StudentCard';
import VideoCard from '../../components/VideoCard';
import Calendar from '../../components/Calendar';

const Profile: React.FC = () => {
  const [userType, setUserType] = useState<string>();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string>();
  const [matched, setMatched] = useState<boolean>(false);
  const [subAccounts, setSubAccounts] = useState();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [videos, setVideos] = useState();
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [date, setDate] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState();
  const [thumbnail, setThumbnail] = useState();
  const [loggedInUserId, setLoggedInUserId] = useState<string>();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);


  const { id } = useParams();

  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const modalRef2 = useRef<HTMLDivElement>(null);

  // use effect that calls when id is changed
  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setLoggedInUserId(localStorage.getItem('id'));
    setUserType(localStorage.getItem('userType'));
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode === 'enabled') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
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
    if (user !== null) {
      getAssignedTasks();
    }
  }, [user]);

  useEffect(() => {
    getVideos();
  }, [user]);

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
      return response.json();
    })
      .then(data => {
        // check if the teachers id is in the kids teachers list
        for (let i = 0; i < data.matches.length; i++) {
          if (data.matches[i].userId === localStorage.getItem('id')) {
            setMatched(true);
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
      return response.json();
    }).then(data => {
      setSubAccounts(data.users);
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
      return response.json();
    }).then(data => {
      setVideos(data.fileIds);
    })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  const assign = async (e) => {
    e.preventDefault()
    console.log('Date:', date);
    console.log('Text:', text);
    console.log('File:', file);
    console.log('title:', title);
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/task/assign`, {
      method: 'POST',
      body: JSON.stringify({
        "studentId": user.userId, 
        "teacherId": localStorage.getItem('id'), 
        "taskTitle": title, 
        "taskText": text, 
        "dueDate": date, 
        "filename": file ? file.name : ""
      }),
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
    }).then(response => {
      return response.json();
    }).then(data => {
      fetch(data.uploadUrl, { method: 'PUT', body: file });
      console.log(data)
    }).catch(error => {
      console.error('Error:', error.message, error.code || error);
    });
    setFile(null)
    setText('')
    setTitle('')
    setDate('')
    setShowTaskModal(false)
  }

  const getAssignedTasks = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/tasks?studentId=${id}&teacherId=${localStorage.getItem('id')}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
    }).then(response => {
      return response.json();
    }).then(data => {
      setAssignedTasks(data)
      console.log(data)
    }).catch(error => {
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
        <img onClick={goToEditProfile} src="https://cdn-icons-png.flaticon.com/128/860/860814.png" alt="Edit Profile" className="editprofile-button" />
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
        return (<button className="request-button" onClick={() => setShowModal(true)}>request match</button>);
      } else if (userType === "Parent" && user.userType === "Child") {
        // navigate view matches/ id
        return (<button onClick={viewMatch}>view matches</button>);
      } else if (userType === "Teacher" && (user.userType === "Child" || user.userType === "Student") ) {
        return (<button onClick={() => setShowTaskModal(true)}>Assign task</button>);
      }
    }
  }

  const handleThumbnailClick = (fileId) => {
    navigate(`/video/${id}/${fileId}`)
  }

  const renderExtraContent = () => {
    if (userType === "Student") {
      return (
        <><h2>Achievements</h2>
          <div className="achievements">
            {/* Map through achievements data */}
            <div className="achievement-card">
              <img src="https://example.com/icon.png" alt="Achievement Icon" />
              <div className="achievement-info">
                <h3>Upload Recordings</h3>
                <p><em>Recordings uploaded</em></p>
                <p>Count: 10</p>
              </div>
            </div>
            {/* More achievements */}
          </div></>
      );
    } else if (userType === "Teacher") {
      return (
        <div className="teacher-details">
          <h2>Certifications & Experience</h2>
          {/* Map through certifications data */}
          <div className="certification-card">
            <h3>Certification Name</h3>
            <p>Details about the certification</p>
          </div>
          {/* More certifications */}
          <h2>Reviews & Ratings</h2>
          {/* Map through reviews data */}
          <div className="review-card">
            <p>Review text...</p>
            <p>Rating: 5/5</p>
          </div>
          {/* More reviews */}
        </div>
      );
    } else if (userType === "Parent") {
      return null;
    }
  }

  const handleSubmitReview = async () => {
    await fetch(
      `https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/addTeacherReview`,
      {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          rating: rating,
          reviewMsg: reviewText
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        } else {
          console.log(response);
        }
        return response.json();
      })
    const queryParams = new URLSearchParams();
    window.location.href = `/profile/${id}?${queryParams.toString()}`;
  };

  return (
    <div className={`homepage ${isDarkMode ? 'dark-mode' : ''}`}>
      <NavBar />
      <div className="profile">
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
          {showTaskModal && (
            <div className="modal" ref={modalRef} onClick={handleCloseModal}>
              <div className="modal-content">
                <span className="close" onClick={() => setShowTaskModal(false)}>&times;</span>
                Assign Task
                <form onSubmit={assign}>
                        <div className="form-group">
                            <label htmlFor="date">Due Date:</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="title">Title:</label>
                            <textarea
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="text">Text:</label>
                            <textarea
                                id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="file">Optional File:</label>
                            <input
                                type="file"
                                id="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>
                        <button type="submit">Submit</button>
                    </form>
              </div>
            </div>
          )}
          <div className="pfp">
            {user && <img src={"https://cdn-icons-png.flaticon.com/128/847/847969.png"} alt="Profile" className="profile-icon" />}
          </div>
          {user && <div className="profile-info">
            <div className="profile-words">
              <p className="profileName">Full Name : {user.firstName} {user.lastName}</p>
              <p className="profileUserName">Username : @{user.username}</p>
              <p className="type">User Type : {user.userType}</p>
              <p className="aboutme">About Me : {user.aboutMe}</p>
            </div>

            <div className="render-content">{renderContent()}</div>
          </div>}
        </div>

        {user && user.userType === "Student" && <div className="profile-extra">
          <h2>Videos</h2>
          <div className="profile-videos">
            {(videos && videos.length > 0) ? videos.map(qwe => (
              <VideoCard key={qwe} id={id} fileId={qwe} token={token} handlePress={() => handleThumbnailClick(qwe)} web={true} />
            )
            ) : <p>hi</p>}
          </div>

        </div>}
        {user && userType && userType === "Teacher" && user.userType === ("Student" || "Child") &&
          <div className="profile-extra">
            <h2>Assigned Tasks</h2>
            {assignedTasks && assignedTasks.tasks.map((task) => 
              <div style={{border: '1px solid black'}}>
                <p>Due: {task.dueDate} Title: {task.title}</p>
                <p>Comment: {task.text}</p>
                {task.submitted && <a href={task.submissionLink}>View submission</a>}
              </div>
            )}
          </div>

        }
        

        {user && user.userType === "Teacher" && (
          <div className="profile-extra">
            Reviews:
            {user.teacherReviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-rating">Rating: {review.rating} ★</div>
                <div className="review-message">{review.reviewMsg}</div>
              </div>
            ))}
            {loggedInUserId !== user.userId && (
              <div className="write-review">
                <textarea
                  className="review-input"
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <div className="star-rating">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={index < rating ? "star selected" : "star"}
                      onClick={() => setRating(index + 1)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <button className="submit-review" onClick={handleSubmitReview}>
                  Submit Review
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
