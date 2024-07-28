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
import * as VideoThumbnails from 'expo-video-thumbnails'

const Upload = () => {
  const [video, setVideo] = useState([]);
  const [videoId, setVideoId] = useState();
  const params = useGlobalSearchParams();
  const { authToken } = params;

  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        return null;
      }
    })();
  }, []);

  useEffect(() => {
    getVideos()
  }, []);

  const uploadToS3 = async (videoUri) => {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri)
    const thumbnailRes = await fetch(uri);
    const thumbnailBlob = await thumbnailRes.blob();
    const videoRes = await fetch(videoUri);
    const videoBlob = await videoRes.blob();

    fetch("https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/upload", {
      method: 'POST',
      headers: {
          Authorization: authToken as string,
      },
      body: JSON.stringify({
        userId: '123',
        isRef: false,
        fileId: 'hello'
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
    router.replace({ pathname: `/video`, params: { id, authToken }})
  };

  const getVideos = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/videos?userId=123`, {
      method: 'GET',
      headers: {
        'Authorization': authToken as string,
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
      console.log(data, "videos setting")
      setVideoId(data.fileIds);
    })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  return (
    <View>
      <SafeAreaView className="bg-green-200 h-full">
        <ScrollView>
          {videoId ? videoId.map(id => (<TouchableOpacity key={id} onPress={() => handleVideoPress(id)}>
              <Text>{id}</Text>
          </TouchableOpacity>)): <Text>qweqweq</Text>}
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
