import React, { useState, useEffect } from "react";
import '../app/styles/website.css';
import { useNavigate } from "react-router-dom";

interface StudentCardProps {
    id: string;
    token: string;
}

const StudentCard: React.FC<StudentCardProps> = ({ id, token }) => {
    const [user, setUser] = useState<string>(null);

    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/profile/${id}`);
    }

    useEffect(() => {
        getDetails();
        console.log(id, token)
    }, []);

    useEffect(() => {
        console.log("help", user)
    }, [user]);

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
        }).then(data => {
            console.log('Success:', data);
            setUser(data);
        })
        .catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
}

    return (
        <div className="teacher-card" onClick={handleClick}>
            <div className="teacher-ad">
            </div>
            {user && <div className="teacher-detail">
                <p className="teacher-name">{user.firstName}</p>
            </div>}
            
            <div className="teacher-info">
                <div className="teacher-aboutme">
                </div>
            </div>
        </div>
    )
}

export default StudentCard;