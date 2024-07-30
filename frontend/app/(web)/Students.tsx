import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import StudentCard from '../../components/StudentCard';
import { useNavigate } from 'react-router-dom';
import '../styles/website.css';

const Students: React.FC = () => {
  const [students, setStudents] = useState([]);
  const [id, setId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setId(localStorage.getItem('id'));
    setToken(localStorage.getItem('token'));
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
    if (id && token) {
      getStudents();
    }
  }, [id, token]);

  const getStudents = async () => {
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
      }
      return response.json();
    })
      .then(data => {
        setStudents(data.matches);
      })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  const handleClick = (studentId: string) => {
    navigate(`/profile/${studentId}`);
  }

  return (
    <div className="homepage">
      <NavBar />
      <div className="teacher-container">
        <h1 className="teacher-header">My Students</h1>
        <div className="teachers-list">
          {students.length > 0 ? students.map((student: any) => (
            <StudentCard
              key={student.userId}
              id={student.userId}
              token={token || ''}
              handleClick={handleClick}
            />
          )) : <p>No students found</p>}
        </div>
      </div>
    </div>
  )
}

export default Students;
