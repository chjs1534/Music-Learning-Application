import { StyleSheet, Text, View,  } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  return (
    <SafeAreaView className='bg-gray-100 h-full justify-center items-center'>
      <Text className='text-black text-4xl'>Welcome Back</Text>
    </SafeAreaView>
  )
}

export default Home
