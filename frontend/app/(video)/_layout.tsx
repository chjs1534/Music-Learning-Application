import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const VideoLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen 
          name="Video"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </>
  )
}

export default VideoLayout