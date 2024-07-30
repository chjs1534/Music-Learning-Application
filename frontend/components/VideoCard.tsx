import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native'
import { styled } from 'nativewind';
import video from '../app/video';

interface VideoCardProps {
    id: string;
    fileId: string;
    token: string;
    handlePress
    web: boolean
}

const StyledImage = styled(Image);


const VideoCard: React.FC<VideoCardProps> = ({ id, fileId, token, handlePress, web }) => {
    const [thumbnail, setThumbnail] = useState();

    useEffect(() => {
        getThumbnail();
    }, []);

    useEffect(() => {
        if (thumbnail) {
            console.log(thumbnail)
        }
    }, [thumbnail]);


    const getThumbnail = async () => {
        console.log("qwagagaga", id, fileId)
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
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

            console.log("dataasda", data.downloadThumbnailUrl)
            setThumbnail(data.downloadThumbnailUrl);
        }).catch(error => {
            console.error('Error:', error.message, error.code || error);
        });
    }


    return (
        <>
            {thumbnail && (<TouchableOpacity onPress={handlePress} className="justify-center items-center m-5 border-2 border-white">
                <StyledImage style={web ? styles.web : styles.mobile} source={{ uri: thumbnail }} alt="hello" />
            </TouchableOpacity>)}
        </>

    )
}

const styles = StyleSheet.create({
    web: {
        width: 200,
        height: 200,
    },
    mobile: {
        width: 200,
        height: 200,
    }

});

export default VideoCard;
