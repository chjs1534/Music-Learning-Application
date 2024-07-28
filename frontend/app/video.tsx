import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useRoute } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as ImagePicker from "expo-image-picker"
import * as VideoThumbnails from 'expo-video-thumbnails'
import Button from '../components/Button';

// TODO
// SHOW STATS OR WAHTEVBER AFTER UPLOADING VIDEO


const video = () => {
    const [video, setVideo] = useState();
    const route = useRoute();
    const { id, token } = route.params;
    const ref = useRef(null);

    useEffect(() => {
        getVideo()
    }, []);

    useEffect(() => {
        if (video != null) {
            console.log(video)
        }
    }, [video]);

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

    const pickVideo = async () => {
        console.log("clicked button");

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
            base64: true,
        });
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(result);
        if (!result.canceled) {
            // send the video to the backend
            uploadToS3(result.assets[0].uri)
        }
    };
    const uploadToS3 = async (videoUri) => {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri)
        const thumbnailRes = await fetch(uri);
        const thumbnailBlob = await thumbnailRes.blob();
        const videoRes = await fetch(videoUri);
        const videoBlob = await videoRes.blob();
        console.log(token)

        fetch("https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/upload", {
            method: 'POST',
            headers: {
                Authorization: token as string,
            },
            body: JSON.stringify({
                userId: '123',
                isRef: true,
                fileId: id
            }),
        })
            .then(response => {
                console.log(response)
                return response.json()
            })
            .then(json => {
                fetch(json.uploadVideoUrl, { method: 'PUT', body: videoBlob });
                fetch(json.uploadThumbnailUrl, { method: 'PUT', body: thumbnailBlob });
            })
    };

    return (
        <View>
            <Text>{id}</Text>
            <Text>hello</Text>
            <View className="m-1 border-black border-2 p-1">
                <Video
                    source={{ uri: video }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="contain"
                    style={{ width: '100%', height: 200 }}
                    useNativeControls
                />
            </View>
            <Button
                title="Upload rerference Video"
                containerStyles="bg-green-400 m-5 pt-5 pb-5 pl-7 pr-7"
                textStyles="text-lg font-semibold"
                handlePress={pickVideo}
            />
        </View>
    )
}

export default video

const styles = StyleSheet.create({})