import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const AuthLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen 
          name="Login"
          options={{
            headerShown: false,
            statusBarHidden: true
          }}
        />
      </Stack>
    </>
  )
}

export default AuthLayout
