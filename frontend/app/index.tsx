import { ScrollView, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';

export default function App() {
  return (
    <SafeAreaView className="h-full">
        <ScrollView contentContainerStyle={{ height: '100%' }}>
            <View className="w-full justify-center items-center min-h-[85vh] px-4">
                <Text className="text-3xl">Mewsic</Text>
                <Button 
                    title="Continue with Email"
                    handlePress={() => router.push('/Login')}
                    containerStyles="w-full mt-7"
                />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}
