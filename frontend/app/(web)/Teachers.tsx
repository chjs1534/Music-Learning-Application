import React, { useState, useEffect } from 'react'
import NavBar from './NavBar';
import TeacherCard from '../../components/TeacherCard';
import '../styles/website.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState();
  const [myTeachers, setMyTeachers] = useState();
  const [id, setId] = useState<string>();
  const [token, setToken] = useState<string>();

  //fetch teachers
  useEffect(() => {
    setId(localStorage.getItem('id'))
    setToken(localStorage.getItem('token'))
    getMyTeachers();
    getDetails();
    
  }, []);

  useEffect(() => {
    console.log(teachers)
  }, [teachers]);
  useEffect(() => {
    console.log("crycry", myTeachers)

  }, [myTeachers]);

  const getDetails = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUsersByType/Teacher`, {
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
        setTeachers(data.users);
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
        console.log('Success:', data);
        setMyTeachers(data);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  return (
    <div className="homepage">
      <div className="profile">
        <NavBar />
        <div className="teacher-container">
          <h1 className="teacher-header">My Teachers</h1>
          <div className="myteachers">
            {myTeachers && myTeachers.matches.length > 0 ? (myTeachers.matches.map(teacher => (
              <TeacherCard
                id={teacher.userId}
                token={token}
              />
            ))) : <p>No teachers</p>}
          </div>
          <h1 className="teacher-header">Recommended Teachers</h1>
          <div className="myteachers">
            {teachers && teachers.length > 0 ? (teachers.map(teacher => (
              <TeacherCard
                id={teacher.userId}
                token={token}
              />
            ))) : <p>No teachers</p>
            }
          </div>
        </div>


      </div>
    </div>
  )
}

export default Teachers
