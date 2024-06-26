import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            backgroundColor: "#6A80C8",
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: "#4059AD",
          },
        }}
      >
        <Tabs.Screen 
            name="Home"
            options={{
            title: 'Home',
            headerShown: false
          }}/>
          <Tabs.Screen 
            name="Upload" 
            options={{
            title: 'Upload',
            headerShown: false
          }}/>
          <Tabs.Screen 
            name="Profile" 
            options={{
            title: 'Profile',
            headerShown: false
          }}/>
          <Tabs.Screen 
            name="Settings" 
            options={{
            title: 'Settings',
            headerShown: false
          }}/>
      </Tabs>
    </>
  )
}

export default TabsLayout

const styles = StyleSheet.create({})