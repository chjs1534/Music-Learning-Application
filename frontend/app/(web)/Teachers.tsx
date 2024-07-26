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
  }, []);

  useEffect(() => {
    getMyTeachers();
  }, [id, token]);

  useEffect(() => {
    getDetails();
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
        console.log("tytytyy",myTeachers);
        // filter teachers by myteachers
        if (myTeachers.matches.length > 0) {
          const filteredList = data.users.filter(item => !myTeachers.includes(item));
          setTeachers(filteredList);
        }
        setTeachers(data.users);
        console.log('something', teachers);

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
            ))) : null}
          </div>
          <h1 className="teacher-header">Recommended Teachers</h1>
          <div className="myteachers">
            {teachers && teachers.length > 0 ? (teachers.map(teacher => (
              <TeacherCard
                id={teacher.userId}
                token={token}
              />
            ))) : null
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Teachers
