import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import {AuthContext} from '../../context';


const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] =useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useContext(AuthContext);

  const handleSignup = async() => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if(!username || !email || !password) {
      Alert.alert('Error', 'Wrong Credentials');
      return;
    }

    try {
      await register(username, email, password);
      router.replace('/screens/HomeScreen');
    } catch(err) {
      Alert.alert('Error', err);
    }

  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        keyboardType="Username"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

<View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Password"
    placeholderTextColor="#aaa"
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={setPassword}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    <Icon
      name={showPassword ? 'eye' : 'eye-off'}
      size={20}
      color="#aaa"
    />
  </TouchableOpacity>
</View>

<View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Re-enter Password"
    placeholderTextColor="#aaa"
    secureTextEntry={!showConfirmPassword}
    value={confirmPassword}
    onChangeText={setConfirmPassword}
  />
  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
    <Icon
      name={showConfirmPassword ? 'eye' : 'eye-off'}
      size={20}
      color="#aaa"
    />
  </TouchableOpacity>
</View>


      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/screens/LoginScreen')}>
        <Text style={styles.switchText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    color: '#66fcf1',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1f2833',
    color: '#fff',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#45a29e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#0b0c10',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    color: '#c5c6c7',
    marginTop: 20,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2833',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,         // increase font size
    paddingVertical: 4,   // better text alignment
    minHeight: 40,
  },
  
});
