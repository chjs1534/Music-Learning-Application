import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const RootLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="index" options={{headerShown: false, statusBarHidden:true}}/>
        <Stack.Screen name="(auth)" options={{headerShown: false, statusBarHidden:true}}/>
        <Stack.Screen name="(tabs)" options={{headerShown: false, statusBarHidden:true}}/>
        <Stack.Screen name="video" options={{headerShown: false, statusBarHidden:true}}/>
    </Stack>
  )
}

export default RootLayout
