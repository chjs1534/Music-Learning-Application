import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Match from '../../components/Match';
import NavBar from './NavBar';
import '../styles/viewMatchStyles.css';
import TeacherCard from '../../components/TeacherCard';

const ViewMatches = () => {
    const [teachers, setTeachers] = useState();
    const [user, setUser] = useState();

    const { id } = useParams();

    const token = localStorage.getItem('token');

    useEffect(() => {
        getMatches();
      }, [id, token]);

      useEffect(() => {
        getDetails();
      }, [teachers]);

    const onAction = () => {
        getMatches();
    }

    const getDetails = async () => {
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


    const getMatches = async () => {
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
                setTeachers(data);
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error.message, error.code || error);
            });
    }

    return (
    <div className="homepage">
      <NavBar />
      <div className="profile">
        
        <div className="view-matches-page">
          {user && <h1 className="view-matches-for">Matches for {user.firstName + " " + user.lastName}</h1>}
          <div className="matches-list">
            {teachers && teachers.matches.length > 0 ? (teachers.matches.map(teacher => (
              <Match
                childId={id}
                teacherId={teacher.userId}
                token={token}
                onAction={onAction}
              />
            ))) : <p className="matches-text">No matches</p>}
          </div>
        </div>
      </div>
    </div>
    )
}

export default ViewMatches;