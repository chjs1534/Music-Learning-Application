import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGlobalSearchParams } from "expo-router";
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { router } from 'expo-router';
import { USERPOOL_ID, CLIENT_ID } from '@env';

const poolData = {
  UserPoolId: USERPOOL_ID,
  ClientId: CLIENT_ID
};


const Profile = () => {
  const [user, setUser] = useState();

  const params = useGlobalSearchParams();
  const { authToken, userId } = params;

  useEffect(() => {
    getDetails()
  }, [])

  const logout = async () => {
    //logout
    const UserPool = new CognitoUserPool(poolData);

    const user = UserPool.getCurrentUser();
    user.signOut();
    router.push('/Login');
  }

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
    <SafeAreaView className='bg-gray-100 h-full'>
      <Text className='text-3xl font-semibold m-5 text-black'>Profile</Text>
      <View className="display-flex flex-row">
        <Image source={require('../assets/profile.png')} style={[styles.image, { tintColor: 'gray' }]} className="m-5" />
        {user &&
          <View className="flex-col mt-6">
            <Text className='text-black text-2xl'>{user.firstName} {user.lastName}</Text>
            <Text className='text-gray-500 text-1.5xl'>@{user.username}</Text>
          </View>
        }
      </View>
      {user && <View className="m-5">
        <Text className='text-black'>About me: </Text>
        <View className="border-gray-400 border-2">
          <Text className="text-gray-400 m-3">{user.aboutMe}</Text>
        </View>
      </View>}
      <TouchableOpacity onPress={logout} className="m-5">
          <Text className="text-blue-400">Logout</Text>
        </TouchableOpacity>
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