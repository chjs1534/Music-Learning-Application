import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'

const TabsLayout = () => {
  return (
    <>
      <Tabs>
        <Tabs.Screen 
            name="home" 
            options={{
            title: 'Home',
            headerShown: false
          }}/>
          <Tabs.Screen 
            name="upload" 
            options={{
            title: 'Upload',
            headerShown: false
          }}/>
          <Tabs.Screen 
            name="profile" 
            options={{
            title: 'Profile',
            headerShown: false
          }}/>
      </Tabs>
    </>
  )
}

export default TabsLayout

const styles = StyleSheet.create({})