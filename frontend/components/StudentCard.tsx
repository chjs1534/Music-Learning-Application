import React, { useState, useEffect } from "react";
import '../app/styles/website.css';

interface StudentCardProps {
    id: string;
    token: string;
    handleClick: (id: string) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ id, token, handleClick }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        getDetails();
    }, []);

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
            return response.json();
        }).then(data => {
            setUser(data);
        })
            .catch(error => {
                console.error('Error:', error.message, error.code || error);
            });
    }

    return (
        <div className="student-card" onClick={() => handleClick(id)}>
            <div className="student-ad">
                <img src={"https://cdn-icons-png.flaticon.com/128/9316/9316730.png"} alt={"student ad"} />
            </div>
            {user && <div className="student-detail">
                <img src={"https://cdn-icons-png.flaticon.com/128/9316/9316744.png"} alt={`${user.firstName} ${user.lastName}'s profile`} className="student-pfp" />
                <p className="student-name">Name: {user.firstName} {user.lastName}</p>
                <p className="student-aboutme">About Me: {user.aboutMe}</p>
            </div>}
        </div >
    )
}

export default StudentCard;
