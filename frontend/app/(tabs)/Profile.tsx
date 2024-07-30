import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGlobalSearchParams } from "expo-router";

const Profile = () => {
  const [user, setUser] = useState();

  const params = useGlobalSearchParams();
  const { authToken, userId } = params;

  useEffect(() => {
    getDetails()
  }, [])

  const getDetails = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': authToken as string,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        console.log(data)
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  return (
    <SafeAreaView className="bg-black h-full">
      <Text className="text-3xl font-semibold text-white m-5">Profile</Text>
      <View className="display-flex flex-row">
        <Image source={require('../assets/profile.png')} style={[styles.image, {tintColor: 'gray'}]} className="m-5"/>
        {user &&
          <View className="flex-col mt-6">
            <Text className="text-white text-2xl">{user.firstName} {user.lastName}</Text>
            <Text className="text-gray-500 text-1.5xl">@{user.username}</Text>
          </View>
          }
      </View>
      <View className="m-5">
        <Text className="text-white">About me:</Text>
        <View className="border-white border-2">
          <Text className="text-gray-300 m-3">about me text</Text>
        </View>
      </View>
      <View className="m-5">
        <Text className="text-white">User Statistics</Text>
        <View className="border-white border-2">
          <Text className="text-gray-300 m-3">Graph</Text>
        </View>
      </View>
      
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  }
})