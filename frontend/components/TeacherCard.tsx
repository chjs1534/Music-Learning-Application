import React, { useState, useEffect } from "react";
import '../app/styles/website.css';
import { useNavigate } from "react-router-dom";

interface TeacherCardProps {
  name: string;
  pfp: string;
  rating: number;
  reviews: number;
  skills: [string];
  aboutme: string;
  ad: string;
  id: string;
  token: string;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ name, pfp, rating, reviews, skills, aboutme, ad, id, token }) => {
  const [user, setUser] = useState<string>(null);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/profile/${id}`);
  }
  useEffect(() => {
    getDetails();
    console.log("kokokok")
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

  return (
    <div className="teacher-card" onClick={handleClick}>
      <div className="teacher-ad">
        <img src={"https://cdn-icons-png.flaticon.com/128/125/125104.png"} alt={"teacher ad"} />
      </div>
      {user && <div className="teacher-detail">
        <img src={"https://cdn-icons-png.flaticon.com/128/2354/2354280.png"} alt={`${name}'s profile`} className="teacher-pfp" />
        <p className="teacher-name">Name : {user.firstName} {user.lastName}</p>
        <p className="teacher-aboutme">About Me : {user.aboutMe}</p>
        <p className="teacher-rating">Rating: {rating} ({reviews})</p>
      </div>}
    </div >
  )
}

export default TeacherCard;