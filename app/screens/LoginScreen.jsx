import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import {AuthContext} from '../../context';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      const {success} = await login(email, password);
      if(success === false) {
        Alert.alert('Error in Logging In');
        return;
      }
      router.replace('/screens/HomeScreen');
    } catch (err) {
      Alert.alert('Login Failed', 'Invalid credentials or network error');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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


      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/screens/SignupScreen')}>
        <Text style={styles.switchText}>Don't have an account? Signup</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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
