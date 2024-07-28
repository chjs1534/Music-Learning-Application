import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useVideoPlayer, VideoView } from 'expo-video';
import { Button, StyleSheet } from 'react-native';

const Video: React.FC = () => {
    const [video, setVideo] = useState();
    const [isPlaying, setIsPlaying] = useState(false);

    const { id } = useParams();

    const ref = useRef(null);

    const getVideo = async () => {
        const res = await fetch("https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download", {
          method: 'POST',
          body: JSON.stringify({
            'userId': '123',
            fileId: id,
            isRef: false
          }),
          headers: {
                'Content-Type': 'application/json'
            },
        });
      
        const json = await res.json();
        console.log(json.downloadVideoUrl);
        setVideo(json.downloadVideoUrl);
      };

    let player = useVideoPlayer(video, player => {
        player.loop = false;
        player.play();
    });

    useEffect(() => {
        getVideo()
        player.replace(video)
    }, [player]);

    useEffect(() => {
        const subscription = player.addListener('playingChange', isPlaying => {
            setIsPlaying(isPlaying);
        });

        return () => {
            subscription.remove();
        };
    }, [player]);

    return (
        <div>
            <p>{id}</p>
            <VideoView
                ref={ref}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
                style={styles.video}
            />
        </div>
    )
}

const styles = StyleSheet.create({
    video: {
      width: 350,
      height: 275,
    },
  })

export default Video
