import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useGlobalSearchParams } from 'expo-router';
import { AuthContext } from '../../context';

export default function HuntScreen() {
    const { huntId } = useGlobalSearchParams();
    const [currentHunt, setCurrentHunt] = useState(null);
    const { fetchHuntById, setActiveHunt, setCurrentClueIndex, addHuntToUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadHuntDetails = async () => {
            try {
                setLoading(true);
                console.log('helloWorld ' + huntId);
                if(!huntId) {
                    console.log('Hello World');
                    return;
                }
                const hunt = await fetchHuntById(huntId);
                setCurrentHunt(hunt);
                setLoading(false);
            } catch (err) {
                Alert.alert('Error', 'Failed to load hunt details');
                setError(err.message);
                setLoading(false);
            }
        };

        loadHuntDetails();
    }, [huntId]);

    const startButtonClicked = async () => {

        if(!currentHunt) {
            Alert.alert('No Hunt available');
        }

        setActiveHunt(currentHunt);
        setCurrentClueIndex(0);

        try {
            const res = await addHuntToUser();
            if(res.success) {
                router.replace('/screens/activeRiddleScreen');
            }
            else {
                Alert.alert('Error');
            }
        } catch(err) {
            Alert.alert("Error", err);
            return;
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading hunt details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hunt Details</Text>
            
            {currentHunt ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{currentHunt.place || 'Untitled Hunt'}</Text>
                    <Text style={styles.cardText}>{currentHunt.description || 'No description available'}</Text>
                    
                    <View style={styles.detailsRow}>
                        <Text style={styles.detailLabel}>Clues:</Text>
                        <Text style={styles.detailValue}>{currentHunt.numberOfClues || currentHunt.clues?.length || 0}</Text>
                    </View>
                    
                    <View style={styles.detailsRow}>
                        <Text style={styles.detailLabel}>Completed by:</Text>
                        <Text style={styles.detailValue}>{currentHunt.numberOfPlayersCompleted || 0} players</Text>
                    </View>
                    
                    <View style={styles.detailsRow}>
                        <Text style={styles.detailLabel}>Total Points:</Text>
                        <Text style={styles.detailValue}>{currentHunt.totalPoints || 0}</Text>
                    </View>

                    {/* Display the first clue as a preview */}
                    {currentHunt.clues?.length > 0 && (
                        <View style={styles.cluePreview}>
                            <Text style={styles.sectionTitle}>First Clue Preview</Text>
                            <Text style={styles.clueText}>{currentHunt.clues[0].description}</Text>
                            {currentHunt.clues[0].hints?.length > 0 && (
                                <Text style={styles.hintText}>Hints available: {currentHunt.clues[0].hints.length}</Text>
                            )}
                        </View>
                    )}
                </View>
            ) : (
                <Text style={styles.noHuntText}>No hunt details available</Text>
            )}

            <TouchableOpacity 
                style={styles.startButton}
                onPress={() => {
                    startButtonClicked()
                }}
            >
                <Text style={styles.buttonText}>Start Hunt</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0c10',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 24,
        paddingTop: 50,
    },
    title: {
        fontSize: 28,
        color: '#66fcf1',
        marginBottom: 30,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#1f2833',
        width: '100%',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#45a29e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 22,
        color: '#66fcf1',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    cardText: {
        fontSize: 16,
        color: '#c5c6c7',
        marginBottom: 20,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#45a29e',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 16,
        color: '#c5c6c7',
    },
    sectionTitle: {
        fontSize: 18,
        color: '#66fcf1',
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 10,
    },
    cluePreview: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#45a29e',
    },
    clueText: {
        fontSize: 15,
        color: '#c5c6c7',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    hintText: {
        fontSize: 14,
        color: '#45a29e',
    },
    startButton: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: '#45a29e',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#0b0c10',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingText: {
        color: '#66fcf1',
        fontSize: 18,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 18,
    },
    noHuntText: {
        color: '#c5c6c7',
        fontSize: 18,
        marginBottom: 30,
    },
});