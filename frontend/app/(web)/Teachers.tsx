import React, { useState } from 'react'
import NavBar from './NavBar';
import TeacherCard from '../../components/TeacherCard';
import '../styles/website.css';

const Teachers = () => {
    const [teachers, setTeachers] = useState();
    return (
        <div className="homepage">
          <div className="profile">
            <NavBar />
            <div className="teacher-container">
              <h1 className="teacher-header">My Teachers</h1>
              <div className="myteachers">
                <TeacherCard name="ben" rating="0"/>
                <TeacherCard name="codey" rating="0"/>
                <TeacherCard name="ben" rating="0"/>
                <TeacherCard name="ben" rating="0"/>
              </div>
              <h1 className="teacher-header">Recommended Teachers</h1>
              <div className="myteachers">
                <TeacherCard />
              </div>
            </div>
            
            
          </div>
        </div>
      )
}

export default Teachers
