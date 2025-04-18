import { Stack } from 'expo-router';
import {AuthProvider} from '../context';

export default function Layout() {
  return (
    <AuthProvider>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0b0c10' },
        headerTintColor: '#66fcf1',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="screens/LoginScreen" options={{ title: 'Login' }} />
      <Stack.Screen name="screens/SignupScreen" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="screens/HomeScreen" options={{ title: 'Home', headerBackTitle: 'Logout' }} />
    </Stack>
    </AuthProvider>
  );
}