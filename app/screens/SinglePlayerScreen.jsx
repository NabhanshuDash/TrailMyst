import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList } from 'react-native';
import { router } from 'expo-router';

export default function SinglePlayerScreen() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [hunts, setHunts] = useState([]);
  const [error, setError] = useState('');

  // Mock API call - replace with your actual backend call
  const fetchHunts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - replace with actual API response
      const mockHunts = [
        { id: '1', name: 'Treasure Hunt 1', imageUrl: '../../asset/maps/h1.jpg' },
        { id: '2', name: 'Adventure Hunt', imageUrl: '../../asset/maps/h2.jpg' },
        { id: '3', name: 'City Explorer', imageUrl: '../../asset/maps/h3.jpg' },
      ];
      
      setHunts(mockHunts);
    } catch (err) {
      setError('Failed to fetch hunts. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        onPress={fetchHunts}
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
      {hunts.length > 0 && (
        <View style={styles.huntsContainer}>
          <Text style={styles.sectionTitle}>Available Hunts</Text>
          <FlatList
            data={hunts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.huntCard}
                onPress={() => router.push(`/hunt/${item.id}`)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.huntImage}
                  resizeMode="cover"
                />
                <Text style={styles.huntName}>{item.name}</Text>
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