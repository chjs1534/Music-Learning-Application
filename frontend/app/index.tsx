import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push('/Login');
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    null
  );
}
