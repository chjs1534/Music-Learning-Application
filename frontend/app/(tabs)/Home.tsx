import { StyleSheet, Text, View,  } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  return (
    <SafeAreaView className="bg-black h-full justify-center items-center">
      <Text className="text-3xl font-semibold text-gray-300">Welcome Back</Text>
    </SafeAreaView>
  )
}

export default Home
