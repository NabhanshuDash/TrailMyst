import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, Image } from 'react-native';
import { AuthContext } from '../../context';
import { router } from 'expo-router';

export default function SinglePlayerScreen() {
    const [hunts, setHunts] = useState(null);
    const [location, setLocation] = useState('');
    const {fetchHunts} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [huntImages, setHuntImages] = useState({});

    // Images for hunts
    const huntPhotos = [
      require('../../assets/maps/h1.jpg'),
      require('../../assets/maps/h2.jpg'),
      require('../../assets/maps/h3.jpg'),
      require('../../assets/maps/h4.jpg'),
      require('../../assets/maps/h5.jpg'),
      require('../../assets/maps/h6.jpg'),
    ];

    const fetchHunt = async() => {
      setLoading(true);
      setError('');

      try {
        const res = await fetchHunts(location);
        console.log('Fetched hunts:', res);

        // Assign random images to each hunt
        const imageAssignments = {};
        res.forEach(hunt => {
          const randomIndex = Math.floor(Math.random() * huntPhotos.length);
          imageAssignments[hunt] = huntPhotos[(randomIndex+1)%6];
        });
        
        setHuntImages(imageAssignments);
        setHunts(res);
        setLoading(false);
      } catch(err) {
        Alert.alert('Error hunt cannot be fetched', err);
        setLoading(false);
      }
    }

    return (
      <View style={styles.container}>
      <Text style={styles.title}>Single Player Mode</Text>
      
      {/* Location Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your location"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor="#aaa"
      />
      
      {/* Search Button */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={fetchHunt}
        disabled={loading || !location.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Find Nearby Hunts</Text>
        )}
      </TouchableOpacity>
      
      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {/* Hunts List */}
      {hunts && (!loading) && (
        <View style={styles.huntsContainer}>
          <Text style={styles.sectionTitle}>Available Hunts</Text>
          <FlatList
            data={hunts}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.huntCard}
                onPress={() => router.push(`/hunt/${item}`)}
              >
                <Image
                  source={huntImages[item]}
                  style={styles.huntImage}
                  resizeMode="cover"
                />
                <Text style={styles.huntName}>{location}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#66fcf1',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1f2833',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#45a29e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#0b0c10',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 20,
  },
  huntsContainer: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#66fcf1',
    fontSize: 20,
    marginBottom: 15,
    fontWeight: '600',
  },
  huntCard: {
    backgroundColor: '#1f2833',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  huntImage: {
    width: '100%',
    height: 150,
  },
  huntName: {
    color: '#fff',
    padding: 15,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});