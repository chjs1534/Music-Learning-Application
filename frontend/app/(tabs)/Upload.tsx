import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../../components/Button'
import * as ImagePicker from "expo-image-picker"
import { Video } from 'expo-av'
import { USERPOOL_ID } from '@env'
import { useGlobalSearchParams } from "expo-router"
import { ffmpeg } from 'fluent-ffmpeg'
import * as VideoThumbnails from 'expo-video-thumbnails'

const Upload = () => {
  // const camera = useRef(null);
  // const [cameraPermission, setCameraPermission] = useState('');
  // const [microphonePermission, setMicrophonePermission] = useState('');
  // const [videoPath, setVideoPath] = useState();
  const [video, setVideo] = useState([]);
  const params = useGlobalSearchParams();
  console.log(params);
  const { authToken } = params;
  console.log(authToken);
  console.log(USERPOOL_ID);
  // useEffect(() => {
  //   (async () => {
  //     const cameraPermissionStatus = await Camera.requestCameraPermission();
  //     const microphonePermissionStatus = await Camera.requestMicrophonePermission();
  //     setCameraPermission(cameraPermissionStatus);
  //     setMicrophonePermission(microphonePermissionStatus);
  //   })();
  // }, []);

  // if (cameraPermission === '' || microphonePermission === '') {
  //   //  add error to request for camera and microphone permissions
  //   return <Text>Requesting permissions</Text>
  // }

  // const devices = useCameraDevices();
  // const cameraDevice = devices.find(device => device.position === 'back');

  // const handleRecordVideo = async () => {
  //   try {
  //     camera.current.startRecording({
  //       flash: 'on',
  //       onRecordingFinished: video => setVideoPath(video.path),
  //       onRecordingError: error => console.error(error),
  //     })
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  // const handleStopVideo = async () => {
  //   try {
  //     await camera.current.stopRecording();
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  // const renderRecordingVideo = () => {
  //   return (
  //     <View>
  //       <Camera 
  //         ref={camera}
  //         device={cameraDevice}
  //         isActive={true}
  //         video
  //       />
  //       <View>
  //         <TouchableOpacity onPress={handleRecordVideo}>
  //           <Text>Record Video</Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity onPress={handleStopVideo}>
  //           <Text>stop Video</Text>
  //         </TouchableOpacity>
  //       </View>
  //       <View>
  //       {videoPath && (
  //         <Video source={{  uri: videoPath }} />
  //       )}
  //       </View>
  //     </View>
      
  //   )
  // }

  // const renderContent = () => {
  //   if (cameraDevice == null) {
  //     return null;
  //   }
  //   if (cameraPermission !== 'granted') {
  //     return null;
  //   }
  //   return renderRecordingVideo();
  // }

  // uploading logic
  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        return null;
      }
    })();
  }, []);

  const uploadToS3 = async (videoUri) => {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri)
    const thumbnailRes = await fetch(videoUri);
    const thumbnailBlob = await thumbnailRes.blob();
    const videoRes = await fetch(uri);
    const videoBlob = await videoRes.blob();

    fetch("https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/upload", {
      method: 'POST',
      headers: {
          Authorization: authToken as string,
      },
      body: JSON.stringify({
        userId: "123"
      }),
    })
    .then(response => response.json())
    .then(json => {
      fetch(json.uploadVideoUrl, { method: 'PUT', body: videoBlob });
      fetch(json.uploadThumbnailUrl, { method: 'PUT', body: thumbnailBlob });      
    });
  };

  const generateReview = async () => {
    fetch("https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/upload", {
      method: 'POST',
      headers: {
          Authorization: authToken as string,
      },
      body: JSON.stringify({
        userId: "123",
        
      }),
    })
  };

  const pickVideo = async () => {
    console.log("clicked button");

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
      base64: true, 
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(result);
    if (!result.canceled) {
      console.log(":D");
      setVideo(prevVideos => [...prevVideos, result.assets[0].uri]);
      // send the video to the backend
      uploadToS3(result.assets[0].uri)
    }

  };

  const recordVideo = async () => {
    console.log("recordVideo function called");
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        base64: true, 
      });

      console.log(result);

      if (!result.canceled) {
        console.log("Video recorded:", result.assets[0].uri);
        setVideo(prevVideos => [...prevVideos, result.assets[0].uri]);
        // send video to backend
        uploadToS3(result.assets[0].uri)
      } else {
        console.log("Video recording canceled");
      }
    } catch (error) {
      console.log("Error recording video:", error);
    }
  };

  const clearVideos = () => {
    setVideo([]);
  }

  // function to send video to backend

  return (
    <View>
      <SafeAreaView className="bg-green-200 h-full">
        <ScrollView>
        {video.length > 0 ? video.map((videoUri, index) => (
          <View key={index} className="m-1 border-black border-2 p-1">
            <Video
              source={{ uri: videoUri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              style={{ width: '100%', height: 200 }}
              useNativeControls
            />
          </View>
        )) :
        <View className="justify-center items-center min-h-[75vh]">
          <Text className="text-3xl font-bold">Start by uploading a video</Text>
        </View>
        }
        </ScrollView>
        <View className="flex flex-row justify-around">
          <Button 
            title="Upload Video"
            containerStyles="bg-green-400 m-5 pt-5 pb-5 pl-7 pr-7"
            textStyles="text-lg font-semibold"  
            handlePress={pickVideo}     
          />
          <Button 
            title="Record Video"
            containerStyles="bg-green-400 m-5 pt-5 pb-5 pl-7 pr-7"
            textStyles="text-lg font-semibold"    
            handlePress={recordVideo}      
          />
        </View>
      </SafeAreaView>
    </View>
  )
}

export default Upload
