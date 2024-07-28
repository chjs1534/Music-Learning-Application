import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";

interface VideoCardProps {
    id: string;
    token: string;
}


const VideoCard: React.FC<VideoCardProps> = ({ id, token }) => {
    const [thumbnail, setThumbnail] = useState();
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/video/${id}`);
    }

    useEffect(() => {
        getThumbnail();
    }, []);


    const getThumbnail = async () => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download`, {
            method: 'POST',
            body: JSON.stringify({
                'userId': '123',
                fileId: id,
                isRef: false
            }),
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
            console.log(data, "thumbnail setting")
            setThumbnail(data.downloadThumbnailUrl);
        }).catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
    }


    return (
        <div onClick={handleClick}><p>{id}</p><img src={thumbnail} alt="hello" className="profile-icon"/></div>
    )
}

export default VideoCard;
