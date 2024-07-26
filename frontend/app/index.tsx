import { ScrollView, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { useEffect } from 'react';
import Home from './(tabs)/Home';
import Video from './(video)/Video';
import Login from './(auth)/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push('/Home');
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    null
  );
}
