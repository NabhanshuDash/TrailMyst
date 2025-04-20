import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const useLocation = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    let subscriber = null;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission not granted');
        return;
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // update every 1 second
          distanceInterval: 1, // or update after 1 meter
        },
        (location) => {
          setLatitude(location.coords.latitude);
          setLongitude(location.coords.longitude);
        }
      );
    };

    startWatching();

    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, []);

  return { latitude, longitude, errorMsg };
};

export default useLocation;
