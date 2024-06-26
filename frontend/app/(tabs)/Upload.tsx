import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../../components/Button'
import * as ImagePicker from "expo-image-picker"
import { Video } from 'expo-av'

const Upload = () => {
  // const camera = useRef(null);
  // const [cameraPermission, setCameraPermission] = useState('');
  // const [microphonePermission, setMicrophonePermission] = useState('');
  // const [videoPath, setVideoPath] = useState();
  const [video, setVideo] = useState(null);

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

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    console.log("clicked button");
  
    // Wait for 200 milliseconds before launching the image library
    await new Promise(resolve => setTimeout(resolve, 100));

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(result);
    if (!result.canceled) {
      console.log(":D");
      setVideo(result.assets[0].uri);
      // Now you can send the video to the backend
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
      });

      console.log(result); // Log the entire result object

      if (!result.canceled) {
        console.log("Video recorded:", result.assets[0].uri);
        setVideo(result.assets[0].uri);
        // send video to backend
      } else {
        console.log("Video recording canceled");
      }
    } catch (error) {
      console.log("Error recording video:", error);
    }
  };

  const clearVideos = () => {
    setVideo('');
  }

  // function to send video to backend

  return (
    <View>
      <SafeAreaView className="bg-green-200 h-full">
        <Button 
          title="Upload Video"
          containerStyles="bg-green-400 m-10"
          textStyles="text-lg font-semibold"  
          handlePress={pickImage}     
        />
      <Button 
        title="Record Video"
        containerStyles="bg-green-400 m-10"
        textStyles="text-lg font-semibold"    
        handlePress={recordVideo}      
      />
      <Button 
        title="Clear Videos"
        containerStyles="bg-green-400 m-10"
        textStyles="text-lg font-semibold"    
        handlePress={clearVideos}      
      />
       {video && (
          <Video
            source={{ uri: video }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            style={{ width: '100%', height: 200 }}
            useNativeControls
          />
        )}
      </SafeAreaView>
    </View>
  )
}

export default Upload
