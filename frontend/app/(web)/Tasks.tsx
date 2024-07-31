import React, { useState, useEffect } from 'react'
import NavBar from './NavBar'
import '../styles/website.css';
import Calendar from '../../components/Calendar';

const Tasks = () => {
    const [tasks, setTasks] = useState();
    const [userId, setUserId] = useState<string>();
    const [token, setToken] = useState<string>();

    useEffect(() => {
        setUserId(localStorage.getItem('id'));
        setToken(localStorage.getItem('token'));
    }, [])

    useEffect(() => {
        if (userId && token) {
            getTasks();
        }
    }, [userId, token])

    const getTasks = async () => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/tasks?studentId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            return response.json();
        }).then((json) => {
            console.log(json)
            setTasks(json);
        }).catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
    }



    return (
        <div className="homepage">
            <div className="my-teachers">
                <NavBar />
                <Calendar tasks={tasks} web={true} id={userId} token={token}/>
            </div>
        </div>
    )
}

export default Tasks
