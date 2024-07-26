import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const Video = () => {
  const route = useRoute();
  const { id } = route.params;

  return (
    <View>
      <SafeAreaView>
        <Text>Video ID: {id}</Text>
        <View>
          <Button
              title="go bvack"
              containerStyles="bg-white-400 m-5 pt-5 pb-5 pl-7 pr-7"
              textStyles="text-lg font-semibold"
              handlePress={() => router.replace({ pathname: '/Upload'})}
            />
        </View>
      </SafeAreaView>
    </View>
  )
}

export default Video

const styles = StyleSheet.create({})