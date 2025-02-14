import { Platform, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'
import cog from "../assets/cog.png"
import calendar from "../assets/calendar2.png"
import home from "../assets/home.png"
import upload from "../assets/upload.png"
import profile from "../assets/profile.png"
import { SafeAreaView } from 'react-native-safe-area-context'

const TabIcon = ({ icon, color, name, focused }) => {
  
  return (
    <View className={`flex items-center justify-center gap-2 ${(Platform.OS === 'ios') ? "pt-10" : ""}`}>
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
      <SafeAreaView style={styles.container}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: 'white',
            tabBarInactiveTintColor:'#a9a9a9',
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: '#3B82F6',
              height: 80,
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
              name="Tasks" 
              options={{
              title: 'Tasks',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={calendar}
                  color={color}
                  name="Tasks"
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
        </Tabs>
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDD6FE",
  },
});

export default TabsLayout
