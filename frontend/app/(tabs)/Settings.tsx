import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Settings = () => {

  const logout = async () => {
    //logout
    
  }

  return (
    <SafeAreaView className="bg-red-200 h-full justify-center items-center">
      <Text className="text-3xl font-semibold">Settings</Text>
      <TouchableOpacity onPress={logout} className="mt-5">
        <Text className="text-blue-400">Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Settings
