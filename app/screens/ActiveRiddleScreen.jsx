import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Camera } from 'expo-camera';
import { AuthContext } from '../../context';

MapboxGL.setAccessToken('pk.eyJ1IjoiZm91cmhhYW4iLCJhIjoiY205a3c3Y2dwMHBwcDJtczZ2eGEwOHp6cCJ9.Khy9swibo6J_Q6M68yQ7JA');

export default function ActiveRiddleScreen() {
  const { activeHunt, currentClueIndex, solveClue } = useContext(AuthContext);
  const [mapReady, setMapReady] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [hasReached, setHasReached] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const currentClue = activeHunt?.clues?.[currentClueIndex];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleUserLocationUpdate = (location) => {
    setUserLocation(location.coords);
    if (currentClue && !hasReached) {
      const dist = getDistanceFromLatLonInMeters(
        location.coords.latitude,
        location.coords.longitude,
        currentClue.latitue,
        currentClue.longitue
      );
      if (dist < 60) {
        setHasReached(true);
        Alert.alert('🎯 Clue Location Reached', 'Get ready to unlock it!', [
          { text: 'Open Camera', onPress: () => setShowCamera(true) }
        ]);
      }
    }
  };

  if (showCamera && hasPermission) {
    return (
      <Camera style={{ flex: 1 }}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity
            style={styles.treasureButton}
            onPress={() => {
              Alert.alert('Unlocked!', '🎉 Clue solved!');
              setShowCamera(false);
              solveClue(currentClueIndex);
            }}
          >
            <Text style={styles.buttonText}>🎁 Tap to Unlock</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL="mapbox://styles/fourhaan/cm9n0lag2007901qseiw847ey/draft"
        onDidFinishLoadingMap={() => setMapReady(true)}
        onUserLocationUpdate={handleUserLocationUpdate}
        showUserLocation={true}
      >
        <MapboxGL.Camera
          zoomLevel={16}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [81.863478, 25.491141]
          }
        />
        {mapReady &&
          activeHunt.clues.map((clue, idx) => {
            if (idx <= currentClueIndex) {
              return (
                <MapboxGL.PointAnnotation
                  key={`clue-${idx}`}
                  id={`clue-${idx}`}
                  coordinate={[clue.longitue, clue.latitue]}
                >
                  <View
                    style={
                      idx === currentClueIndex
                        ? styles.activeClueMarker
                        : styles.solvedClueMarker
                    }
                  />
                </MapboxGL.PointAnnotation>
              );
            }
            return null;
          })}
      </MapboxGL.MapView>
    </View>
  );
}

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  solvedClueMarker: {
    width: 20,
    height: 20,
    backgroundColor: 'green',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white'
  },
  activeClueMarker: {
    width: 24,
    height: 24,
    backgroundColor: 'gold',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'black'
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  treasureButton: {
    backgroundColor: 'gold',
    padding: 20,
    borderRadius: 12
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black'
  }
});
