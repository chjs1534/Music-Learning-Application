import { StyleSheet, Text, View, BackHandler, Alert, SafeAreaView , TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as ImagePicker from "expo-image-picker"
import * as VideoThumbnails from 'expo-video-thumbnails'

const video = () => {
    const [video, setVideo] = useState();
    const [reference, setReference] = useState();
    const [reviews, setReviews] = useState();
    const [vidSwitch, setVidSwitch] = useState(true);
    const [tempo, setTempo] = useState();
    const [sync, setSync] = useState();
    const [chords, setChords] = useState();

    const route = useRoute();
    const { id, fileId, token } = route.params;
    const ref = useRef(null);
    const ref2 = useRef(null);

    useEffect(() => {
        getVideo();
        getReference();
        getComments();
        getGeneratedReview();
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
                fetch(json.uploadVideoUrl, { method: 'PUT', body: videoBlob }).then(() => {
                    getReference().then(() => {
                        generateReview().then(() => {
                            getGeneratedReview()
                        })
                    })
                });
                fetch(json.uploadThumbnailUrl, { method: 'PUT', body: thumbnailBlob });
            })
    };

    const generateReview = async () => {
        fetch("https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/review", {
            method: 'PUT',
            headers: {
                Authorization: token as string,
            },
            body: JSON.stringify({
                userId: id,
                fileId: fileId
            }),
        }).catch(error => {
            console.log(error)
        })
    }

    const getComments = async () => {
        const res = await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/comments?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const json = await res.json();
        setReviews(json.comments);
    }

    const handleTimestampClick = async (timestamp) => {
        const seconds = timestamp * 1000
        if (ref.current) {
            await ref.current.setPositionAsync(seconds);
            await ref.current.playAsync();
        }
    };

    const getGeneratedReview = async () => {
        console.log('generating refview')
        const res = await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/review?userId=${id}&fileId=${fileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const json = await res.json();
        setSync(json.downloadSyncUrl)
        setTempo(json.downloadTempoUrl)
        setChords(json.chords)
        console.log(json.chords)
    }


    return (
        <View>
            <SafeAreaView className="bg-gray-100 h-full">
                {vidSwitch ? <View className="m-1 border-blue-500 border-2 p-1">
                    <Video
                        ref={ref}
                        source={{ uri: video }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="contain"
                        style={{ width: '100%', height: 200 }}
                        useNativeControls
                    />
                </View>
                : <View className="m-1 border-purple-500 border-2 p-1">
                    <Video
                        ref={ref2}
                        source={{ uri: reference }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="contain"
                        style={{ width: '100%', height: 200 }}
                        useNativeControls
                    />
                </View>
                }
                <View className="display-flex flex-row justify-around">
                    <TouchableOpacity className="bg-blue-500 m-5 p-3" onPress={() => setVidSwitch(!vidSwitch)}>
                        {vidSwitch ? <Text className="text-white">View reference</Text> : <Text className="text-white">View upload</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-blue-500 m-5 p-3" onPress={pickVideo}>
                        <Text className="text-pink-100">Upload reference</Text>
                    </TouchableOpacity>
                </View>
                
                <View className="mt-5 ml-5 mr-5">
                    <Text className="">Teacher reviews:</Text>
                    {reviews ? 
                        <ScrollView>
                            {reviews.map((review) => (
                                <TouchableOpacity key={review.videoTime} className="border-gray border-2 mt-2" onPress={() => handleTimestampClick(review.videoTime)}>
                                    <Text className="">Posted on {review.timestamp}</Text>
                                    <Text className="">(At {Math.round(review.videoTime)}s) {review.commentText}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        : <Text className="text-gray-500 self-center">No teacher reviews yet</Text>
                    }
                </View>
                
                {(sync && tempo && chords) && 
                    <ScrollView className="m-5">
                        <Text className="text-black mt-5">Graphs:</Text>
                        <ScrollView>
                            <View className="m-5 justify-center items-center">
                                <Image style={{width: 350, height: 200, margin: 20}} source={{ uri: sync }} alt="hello" />
                                <Image style={{width: 350, height: 250, margin: 20}} source={{ uri: tempo }} alt="hello" />
                                
                            </View>
                        </ScrollView>
                        <Text className="text-black mt-5 mb-5">Chords:</Text>
                        {chords.map((chord) => 
                            <TouchableOpacity key={chord.timestamp} className="mb-5" onPress={() => handleTimestampClick(chord.timestamp)}>
                                <Text>At {Math.round(chord.timestamp)}s you should play a {chord.chordRef}</Text>
                                <Text>Chord you played: {chord.chordMatch}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                }
            </SafeAreaView>
        </View>

    )
}

export default video
