import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import TeacherCard from '../../components/TeacherCard';
import '../styles/website.css';

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState([]);
  const [myTeachers, setMyTeachers] = useState([]);
  const [id, setId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setId(localStorage.getItem('id'));
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (id && token) {
      getMyTeachers();
      getDetails();
    }
  }, [id, token]);

  const getDetails = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUsersByType/Teacher`, {
      method: 'GET',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
    }).then(response => {
      if (response.status === 204) {
        console.log('Success: No content returned from the server.');
        return;
      }
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      } else {
        console.log(response);
      }
      return response.json();
    })
      .then(data => {
        console.log('Success:', data);
        if (myTeachers.length > 0) {
          const filteredList = data.users.filter((teacher: any) => !myTeachers.some((myTeacher: any) => myTeacher.userId === teacher.userId));
          setTeachers(filteredList);
        } else {
          setTeachers(data.users);
        }
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  };

  const getMyTeachers = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/match/getMatches/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
    }).then(response => {
      if (response.status === 204) {
        console.log('Success: No content returned from the server.');
        return;
      }
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      } else {
        console.log(response);
      }
      return response.json();
    })
      .then(data => {
        console.log('Success:', data);
        setMyTeachers(data.matches);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  };

  return (
    <div className="homepage">
      <div className="my-teachers">
        <NavBar />
        <div className="teacher-container">
          <h1 className="teacher-header">My Teachers</h1>
          <div className="teachers-list">
            {myTeachers.length > 0 ? myTeachers.map((teacher: any) => (
              <TeacherCard key={teacher.userId} id={teacher.userId} token={token || ''} />
            )) : <p>No teachers found</p>}
          </div>
          <h1 className="teacher-header">Recommended Teachers</h1>
          <div className="teachers-list">
            {teachers.length > 0 ? teachers.map((teacher: any) => (
              <TeacherCard key={teacher.userId} id={teacher.userId} token={token || ''} />
            )) : <p>No recommended teachers found</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teachers;