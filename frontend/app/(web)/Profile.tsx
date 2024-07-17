import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import '../styles/website.css';
import NavBar from './NavBar';

const Profile: React.FC = () => {
  const [userType, setUserType] = useState<string>();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string>();
  const [matched, setMatched] = useState<boolean>(true);
  const [subAccounts, setSubAccounts] = useState();

  const { id } = useParams();

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
        if (user.userId in data) {
          setMatched(true);
        }
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }


  // cases
  // 1 own profile where id == id (should have edit button)
  // 2 teacher profile where teacher && id != id && teacher not in mymatches (should have request button)
  // 3 teacher profile where they are in my matches (should have nothing)
  // 4 student profiles (should have nothing)
  // 5 my account profiles (should have nothing)

  // child cases

  // change request button to also ask which kid it is requesting for
  // change to unmatch button if they are already matched

  const renderContent = () => {
    if (id === localStorage.getItem('id')) {
      return (
        <img src={"https://cdn-icons-png.flaticon.com/128/860/860814.png"} alt="edit profile" className="editprofilebutton" />
      );
    } else if (user !== null) {
      if (userType === "Student" && user.userType === "Teacher" && matched === false) {
        return (<button onClick={handleRequest}>request</button>);
      } else if (userType === "Parent" && user.userType === "Teacher" && matched === false) {
        return (<p>hihi</p>);
      } else if (user.userType === "Child") {
        return;
      }
      else {
        return (<button onClick={handleRequest}>request</button>);
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