import React, { useState } from "react";
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
  id: number;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ name, pfp, rating, reviews, skills, aboutme, ad, id }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/profile/${id}`);
  }
  return (
    <div className="teacher-card" onClick={handleClick}>
      <div className="teacher-ad">
        <img src={ad} alt={"teacher ad"} />
      </div>
      <div className="teacher-detail">
        <img src={pfp} alt={`${name}'s profile`} className="teacher-pfp" />
        <p className="teacher-name">{name}</p>
      </div>
      <div className="teacher-info">
        <div className="teacher-aboutme">
          <p>{aboutme}</p>
        </div>
        <p className="teacher-rating">Rating: {rating} ({reviews})</p>
      </div>
    </div>
  )
}

export default TeacherCard;