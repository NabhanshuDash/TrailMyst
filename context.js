import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import jwt_decode from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [User, setUser] = useState(null);
  const BASE_URL = 'https://bba7-2409-40e3-2005-6ba2-3101-4ad1-ba3c-5d41.ngrok-free.app/api';

  // Load token on startup
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setUser({ id: token });
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        console.log('Error loading token:', err);
      }
    };

    loadToken();
  }, []);

  const fetchHunts = async (location) => {
    try {
      const res = await axios.post(`${BASE_URL}/riddles/generate-hunts`, {
        location
      });

      const { huntIDs } = res.data;
      console.log(huntIDs);
      return huntIDs;

    } catch(err) {
      console.log('Hunt Fetching error:', err);
      return null;
    }
  }

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });

      const { user } = res.data;
      await AsyncStorage.setItem('token', user._id);

      setUser({ id: user._id });

      axios.defaults.headers.common['Authorization'] = `Bearer ${user._id}`;

      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: err };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { user } = res.data;
      await AsyncStorage.setItem('token', user._id);

      // console.log(token);

      setUser({ id: user._id });

      axios.defaults.headers.common['Authorization'] = `Bearer ${user._id}`;

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ User, login, register, logout, fetchHunts }}>
      {children}
    </AuthContext.Provider>
  );
};
