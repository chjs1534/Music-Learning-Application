import { Platform, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'
import cog from "../assets/cog.png"
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
            tabBarActiveTintColor: "#1e88e5",
            tabBarInactiveTintColor: "#9e9e9e",
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: "#202020",
              borderTopWidth: 0,
              borderBottomWidth: 0,
              borderTopColor: "#4059AD",
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
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#202020",
  },
});

export default TabsLayout
