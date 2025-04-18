import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      {/* Logo with proper dimensions */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Welcome to Treasure App!</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/screens/LoginScreen')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.outlineButton]}
          onPress={() => router.push('/screens/SignupScreen')}
        >
          <Text style={[styles.buttonText, styles.outlineButtonText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 150,          // Fixed width
    height: 150,         // Fixed height
    alignSelf: 'center', // Center horizontally
    marginBottom: 20,    // Space below logo
  },
  title: {
    fontSize: 32,
    color: '#66fcf1',
    marginBottom: 40,    // Reduced from 48
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',      // Full width container
    marginTop: 20,      // Space above buttons
  },
  button: {
    backgroundColor: '#45a29e',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#0b0c10',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#45a29e',
  },
  outlineButtonText: {
    color: '#45a29e',
  },
});





/*import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
*/