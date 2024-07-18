import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/website.css';
import NavBar from './NavBar';

const Profile: React.FC = () => {
  const [userType, setUserType] = useState<string>();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string>();
  const [matched, setMatched] = useState<boolean>(false);
  const [subAccounts, setSubAccounts] = useState();

  const { id } = useParams();

  const navigate = useNavigate();

  // use effect that calls when id is changed
  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setUserType(localStorage.getItem('userType'));
  }, []);

  useEffect(() => {
    getDetails();
  }, [id, token]);


  useEffect(() => {
    if (user !== null) {
      getMyTeachers();
    }
  }, [user]);

  const viewMatch = () => {
    navigate(`/viewmatch/${id}`);
  }

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

  // fetch user using id
  const getDetails = async () => {
    console.log("asdadadsasdaddad", token)
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${id}`, {
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
        setUser(data);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }


  const handleRequest = async () => {
    console.log(localStorage.getItem('id'), id)

    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/addRequest`, {
      method: 'POST',
      body: JSON.stringify({
        'userId1': localStorage.getItem('id'),
        'userId2': id,
      }),
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
    }).then(()=>{
      alert("request sent")
    })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

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


  // cases

  // teacher view own, student

  // parent views own, child, teacher
  // child will have button to view their matches 
  // teacher willl have button to request a match
  // student views own, teacher
  // teacher will have requst match button

  // change request button to also ask which kid it is requesting for

  const renderContent = () => {
    if (id === localStorage.getItem('id')) {
      return (
        <img src={"https://cdn-icons-png.flaticon.com/128/860/860814.png"} alt="edit profile" className="editprofilebutton" />
      );
    } else if (user !== null) {
      if (userType === "Student" && user.userType === "Teacher") {
        if (matched === false) {
          return (<button onClick={handleRequest}>request</button>);
        } else {
          // unmatch student and teacher if already matched
          return (<button onClick={unmatch}>unmatch</button>);
        }
      } else if (userType === "Parent" && user.userType === "Teacher") {
        // request match have modal for kids
        return (<p>hihi</p>);
      } else if (user.userType === "Child") {
        // navigate view matches/ id
        return (<button onClick={viewMatch}>view matches</button>);
      } else if (user.userType === "Student") {
        return;
      }
    }
  }

  return (
    <div className="homepage">
      <div className="profile">
        <NavBar />
        <div className="details-container">
          <div className="pfp">
            <h2 className="profileword">Profile</h2>
            <img src={"https://cdn-icons-png.flaticon.com/128/5653/5653986.png"} alt="pfp" className="pfp-icon" />
          </div>
          {user && <div className="profiledeets">
            <p className="profileName">{user.firstName} {user.lastName}</p>
            <p className="profileUserName">{user.username}</p>
            <p className="aboutme">aboutme</p>
          </div>}
          <div>{renderContent()}</div>
        </div>
        <div className="details-container2">
          <h2 className="profileword">Teacher Details</h2>
          <p>heloolhelho</p>
        </div>
      </div>
    </div>
  )
}

export default Profile