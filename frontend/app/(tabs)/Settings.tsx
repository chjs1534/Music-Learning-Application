import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { router } from 'expo-router';
import { USERPOOL_ID, CLIENT_ID } from '@env';

const poolData = {
  UserPoolId: USERPOOL_ID,
  ClientId: CLIENT_ID
};

const Settings = () => {

  const logout = async () => {
    //logout
    const UserPool = new CognitoUserPool(poolData);

    const user = UserPool.getCurrentUser();
    user.signOut();
    router.push('/Login');
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
