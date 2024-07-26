import React, { useState, useEffect } from 'react'
import NavBar from './NavBar'
import StudentCard from '../../components/StudentCard';
import { useNavigate } from 'react-router-dom';

const Students: React.FC = () => {
  const [students, setStudents] = useState();
  const [id, setId] = useState<string>();
  const [token, setToken] = useState<string>();

  const navigate = useNavigate();

  useEffect(() => {
    setId(localStorage.getItem('id'))
    setToken(localStorage.getItem('token'))
  }, []);

  useEffect(() => {
    getStudents();
  }, [id, token]);

  const getStudents = async () => {
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
        console.log('Success456:', data);
        setStudents(data);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  const handleClick = (studentId) => {
      navigate(`/profile/${studentId}`);
  }

  return (
    <div className="homepage">
      <div className="profile">
        <NavBar />
        <div className="teacher-container">
          <h1 className="teacher-header">My Students</h1>
          <div className="myteachers">
            {students && students.matches.length > 0 ? (students.matches.map(student => (
              <StudentCard
                id={student.userId}
                token={token}
                handleClick={handleClick}
              />
            ))) : <p>No students</p>
            }
          </div>
        </div>


      </div>
    </div>
  )
}

export default Students
