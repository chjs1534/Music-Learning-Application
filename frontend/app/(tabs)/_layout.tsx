import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'
import cog from "../assets/cog.png"
import home from "../assets/home.png"
import upload from "../assets/upload.png"
import profile from "../assets/profile.png"


const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};


const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#DC7F2E",
          tabBarInactiveTintColor: "#4059AD",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#C9DDFF",
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: "#4059AD",
            height: 70,
          },
        }}
      >
        <Tabs.Screen 
            name="Home"
            options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={home}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}/>
          <Tabs.Screen 
            name="Upload" 
            options={{
            title: 'Upload',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={upload}
                color={color}
                name="Uploads"
                focused={focused}
              />
            ),
          }}/>
          <Tabs.Screen 
            name="Profile" 
            options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={profile}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}/>
          <Tabs.Screen 
            name="Settings" 
            options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={cog}
                color={color}
                name="Settings"
                focused={focused}
              />
            ),
          }}/>
      </Tabs>
    </>
  )
}

export default TabsLayout

const styles = StyleSheet.create({})