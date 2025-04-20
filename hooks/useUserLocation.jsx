// hooks/useUserLocation.js

import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let subscriber;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to play the game.');
        return;
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          setUserLocation(location.coords);
        }
      );
    };

    startTracking();

    return () => {
      if (subscriber) subscriber.remove();
    };
  }, []);

  return userLocation;
};
