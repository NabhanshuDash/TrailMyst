import { View, Text, TouchableOpacity, StyleSheet,Image, Modal } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function HomeScreen() {
    const [showProfile, setShowProfile] = useState(false);
  return (
    <View style={styles.container}>
        <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => setShowProfile(true)}
      >
        <Image
          source={require('../../assets/images/profile-placeholder.png')}
          style={styles.profileIcon}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Choose Game Mode</Text>
      
      {/* Singleplayer Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/game/singleplayer')} // We'll create this screen later
      >
        <Text style={styles.buttonText}>Singleplayer</Text>
      </TouchableOpacity>

      {/* Multiplayer Button */}
      <TouchableOpacity 
        style={[styles.button, styles.outlineButton]}
        onPress={() => router.push('/game/multiplayer')} // We'll create this screen later
      >
        <Text style={[styles.buttonText, styles.outlineButtonText]}>Multiplayer</Text>
      </TouchableOpacity>
      <Modal
        visible={showProfile}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.profileCard}>
            <Image
              source={require('../../assets/images/profile-placeholder.png')}
              style={styles.profileIcon}
            />
            <Text style={styles.profileName}>User Name</Text>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => {
                setShowProfile(false);
                router.replace('/'); // Goes back to index.jsx
              }}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProfile(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 32,
    color: '#66fcf1',
    marginBottom: 48,
    textAlign: 'center',
    fontWeight: 'bold',
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
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1f2833',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#66fcf1',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  profileCard: {
    width: '80%',
    backgroundColor: '#0b0c10',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#45a29e',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    color: '#66fcf1',
    fontSize: 20,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#ff3333',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#1f2833',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeText: {
    color: '#66fcf1',
  },
});