import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../../components/FormField'
import Button from '../../components/Button'
import { router } from 'expo-router'

const Login = () => {
  const [form, setForm] = useState({
    username:'',
    password: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = () => {
    setIsSubmitting(true);
    router.replace("/Home");
  }

  return (
    <SafeAreaView className="h-full bg-purple-200">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Text className="text-5xl mb-5 font-semibold">Mewsic</Text>
          <Text className="text-3xl font-semibold">Login</Text>
          <FormField 
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({...form, username: e})}
            otherStyles="mt-7"
          />
          <FormField 
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles="mt-7"
          />
          <Button
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
            textStyles="text-lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Login
