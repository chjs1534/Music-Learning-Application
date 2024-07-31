import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Calendar from '../../components/Calendar';
import { useGlobalSearchParams } from "expo-router";


const Tasks = () => {
  const [tasks, setTasks] = useState([]);

  const params = useGlobalSearchParams();
  const { authToken, userId } = params;

  useEffect(() => {
    getTasks()
  }, [])

  const getTasks = async () => {
    await fetch(`https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/tasks?studentId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': authToken as string,
        'Content-Type': 'application/json'
      },
    }).then(response => {
      return response.json();
    }).then((json) => {
      console.log(json.tasks)

      setTasks(json);
    }).catch(error => {
      console.error('Error:', error.message, error.code || error);
    });
  }

  return (
    <SafeAreaView className="bg-black h-full">
      <Text className="text-3xl font-semibold text-white m-5">Tasks</Text>
      <View className="justify-center items-center h-5/6">
        {
          tasks && <Calendar tasks={tasks} web={false} id={userId} token={authToken}/>
        }
      </View>

    </SafeAreaView>
  )
}

export default Tasks
