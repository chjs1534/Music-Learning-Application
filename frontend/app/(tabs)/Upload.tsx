import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../../components/Button'
import * as ImagePicker from "expo-image-picker"
import { Video } from 'expo-av'
import { useGlobalSearchParams } from "expo-router"
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import * as VideoThumbnails from 'expo-video-thumbnails'
import VideoCard from '../../components/VideoCard'

const Upload = () => {
  const [videoIds, setVideoIds] = useState();

  const [loading, setLoading] = useState(true);

  const params = useGlobalSearchParams();
  const { authToken, userId } = params;
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

  useEffect(() => {
    getVideos();
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
        userId: userId,
        isRef: false,
        fileId: 'hello'
      }),
    })
    .then(response => {
      console.log(response)
      return response.json()
    })
    .then(json => {
      fetch(json.uploadVideoUrl, { method: 'PUT', body: videoBlob }).then(() => {
        getVideos();
    })
      fetch(json.uploadThumbnailUrl, { method: 'PUT', body: thumbnailBlob });
    })
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
      // send the video to the backend
      uploadToS3(result.assets[0].uri)
    }
  };

  const recordVideo = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        base64: true, 
      });


      if (!result.canceled) {
        // send video to backend
        uploadToS3(result.assets[0].uri)
      }
    } catch (error) {
      console.log("Error recording video:", error);
    }
  }

  const handleVideoPress = (id) => {
    // router.replace({ pathname: `/video`, params: { id, authToken }});
    navigation.navigate('video', { id:userId, fileId:id, token:authToken });
  };

  const getVideos = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/videos?userId=${userId}`, {
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
      if (data.fileIds.length === 0) {
        setVideoIds(null)
      } else {
        setVideoIds(data.fileIds)
      }
      setLoading(false);
    })
      .catch(error => {
        console.error('Error:', error.message, error.code || error);
      });
  }

  return (
    <View>
      <SafeAreaView className="bg-gray-100 h-full">
        <Text className="text-black text-2xl ml-5 mt-5">Start</Text>
        <View className="display-flex flex-row justify-around">
          <TouchableOpacity className="bg-blue-500 m-5 p-3" onPress={pickVideo}>
            <Text className="text-pink-100">Upload New Video</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-blue-500 m-5 p-3" onPress={recordVideo}>
            <Text className="text-pink-100">Record New Video</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-black text-2xl ml-5 mt-5">Videos</Text>
        {!loading ? 
          <>
          {videoIds ?
            <>
              <Text className="text-gray-400 ml-5">Click a video to view its feedback</Text>
              <ScrollView>
                {videoIds.map((id) => (
                  <VideoCard key={id} id={userId as string} fileId={id} token={authToken as string} handlePress={() => handleVideoPress(id)} web={false}/>))}
              </ScrollView>
            </>
            : <Text className="text-gray-400 self-center mt-5">Upload or Record a video to begin</Text>
          }
          </>
          : <Text className="text-gray-400 self-center mt-5">Loading...</Text>}
        <View>
      </View>
      </SafeAreaView>
    </View>
  )
}

export default Upload
