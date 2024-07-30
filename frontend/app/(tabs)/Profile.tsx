import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
  return (
    <SafeAreaView className="bg-black h-full">
      <Text className="text-3xl font-semibold text-white m-5">Profile</Text>
      <View className="display-flex flex-row">
        <Image source={require('../assets/profile.png')} style={[styles.image, {tintColor: 'gray'}]} className="m-5"/>
        <Text className="text-white">hello</Text>
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