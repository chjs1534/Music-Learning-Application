import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../../components/Button'
import * as ImagePicker from "expo-image-picker"
import { Video } from 'expo-av'
import { REACT_APP_USERPOOL_ID_MOBILE } from '@env';
import { useGlobalSearchParams } from "expo-router"
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const Upload = () => {
  const [video, setVideo] = useState([]);
  const params = useGlobalSearchParams();
  const { authToken } = params;
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        return null;
      }
    })();
  }, []);

  const uploadToS3 = async (uri) => {
    const res = await fetch(uri);
    const content = await res.blob();
    fetch("https://ywi1k1tgpg.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/upload", {
      method: 'POST',
      headers: {
          Authorization: authToken as string,
      },
      body: JSON.stringify({
        userId: REACT_APP_USERPOOL_ID_MOBILE
      }),
    })
    .then(response => response.json())
    .then(json => json.uploadURL)
    .then(url => {
      fetch(url, { method: 'PUT', body: content });
    });
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

  const handleVideoPress = (id) => {
    router.replace({ pathname: '/Video', params: { id }})
  };

  return (
    <View>
      <SafeAreaView className="bg-green-200 h-full">
        <ScrollView>
        {video.length > 0 ? video.map((videoUri, index) => (
          <TouchableOpacity key={index} onPress={() => handleVideoPress(videoUri)}>
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
          </TouchableOpacity>
          
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
        <View>
        <Button 
            title="go to video"
            containerStyles="bg-green-400 m-5 pt-5 pb-5 pl-7 pr-7"
            textStyles="text-lg font-semibold"    
            handlePress={() => handleVideoPress('1')}
          />
      </View>
      </SafeAreaView>
    </View>
  )
}

export default Upload
