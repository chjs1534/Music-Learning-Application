import React, { useState, useEffect } from 'react'
import NavBar from './NavBar';
import TeacherCard from '../../components/TeacherCard';
import '../styles/website.css';

const Teachers = ({ id, token }) => {
    const [teachers, setTeachers] = useState();

    //fetch teachers
    useEffect(() => {
      getDetails();
      console.log("xdd", token, id)
    }, []);
    
    useEffect(() => {
      console.log(teachers)
    }, [teachers]);
  
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

    return (
        <div className="homepage">
          <div className="profile">
            <NavBar id={id}/>
            <div className="teacher-container">
              <h1 className="teacher-header">My Teachers</h1>
              <div className="myteachers">
              </div>
              <h1 className="teacher-header">Recommended Teachers</h1>
              <div className="myteachers">
                {teachers && teachers.length > 0 ? (teachers.map(teacher => (
                  <TeacherCard 
                    name={teacher.firstName + ' ' + teacher.lastName} 
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
