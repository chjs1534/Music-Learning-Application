import { StyleSheet, Text, View, BackHandler, Alert, SafeAreaView } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as ImagePicker from "expo-image-picker"
import * as VideoThumbnails from 'expo-video-thumbnails'
import Button from '../components/Button';

// TODO
// SHOW STATS OR WAHTEVBER AFTER UPLOADING VIDEO


const video = () => {
    const [video, setVideo] = useState();
    const [reference, setReference] = useState();
    const [reviews, setReviews] = useState(["hi", "hey"]);

    const route = useRoute();
    const { id, fileId, token } = route.params;
    const ref = useRef(null);

    useEffect(() => {
        getVideo()
        getReference()
        getComments()
    }, []);

    useEffect(() => {
        if (video != null) {
            console.log(video)
        }
    }, [video]);

    const getVideo = async () => {
        const res = await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const json = await res.json();
        console.log(json.downloadVideoUrl);
        setVideo(json.downloadVideoUrl);
    };

    const getReference = async () => {
        await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/download?userId=${id}&fileId=${fileId}&isRef`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((res) => {
            return res.json();
        }).then((json) => {
            setReference(json.downloadVideoUrl);
        }).catch((error) => {
            setReference(null)
        })
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
        console.log(token, id, fileId)

        fetch("https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/upload", {
            method: 'POST',
            headers: {
                Authorization: token as string,
            },
            body: JSON.stringify({
                userId: id,
                isRef: true,
                fileId: fileId
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

    const getComments = async () => {
        const res = await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/comments?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const json = await res.json();
        console.log(json)
        setReviews(json.comments);
    }

    return (
        <View>
            <SafeAreaView className="bg-black h-full">
                <View className="m-1 border-white border-2 p-1">
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
                {reference ?
                    <Video
                        source={{ uri: reference }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="contain"
                        style={{ width: '100%', height: 200 }}
                        useNativeControls
                    />
                    : <Button
                        title="Upload reference Video"
                        containerStyles="bg-green-400 m-5 pt-5 pb-5 pl-7 pr-7"
                        textStyles="text-lg font-semibold"
                        handlePress={pickVideo}
                    />}
                {reviews ? 
                    <View>
                        {reviews.map((text) => (
                            <Text className="text-gray-500">{text}</Text>
                        ))}
                    </View>
                    : <Text className="text-gray-500">No reviews yet</Text>
                }
            </SafeAreaView>
        </View>

    )
}

export default video
