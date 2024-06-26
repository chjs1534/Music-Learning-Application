import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
  return (
    <SafeAreaView className="bg-pink-200 h-full justify-center items-center">
      <Text className="text-3xl font-semibold">Profile</Text>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({})