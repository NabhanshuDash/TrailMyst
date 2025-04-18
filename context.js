import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const BASE_URL = 'http://localhost:5000/api/auth';

  // Load token on startup
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setUser({ id: decoded.id });
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        console.log('Error loading token:', err);
      }
    };

    loadToken();
  }, []);

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/register`, {
        username,
        email,
        password,
      });

      const { token } = res.data;
      await AsyncStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      setUser({ id: decoded.id });

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      const { token } = res.data;
      await AsyncStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      setUser({ id: decoded.id });

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
