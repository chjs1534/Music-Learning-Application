const TeacherCard: React.FC = ({ name, pfp, reviews, rating }) => {
    return (
      <div>
        <p>{name}</p>
        <p>{rating}</p>
        <div>
            {reviews}
        </div>
      </div>
    )
  }

  export default TeacherCard;