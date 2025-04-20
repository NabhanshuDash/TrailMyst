import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity, Animated, Dimensions, Image, Modal } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { AuthContext } from '../../context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import axios from 'axios';

Mapbox.setAccessToken('pk.eyJ1IjoiZm91cmhhYW4iLCJhIjoiY205a3c3Y2dwMHBwcDJtczZ2eGEwOHp6cCJ9.Khy9swibo6J_Q6M68yQ7JA');

const { width, height } = Dimensions.get('window');

const ActiveRiddleScreen = () => {
    const { activeHunt, currentClueIndex, solveClue } = useContext(AuthContext);
    const currentClue = activeHunt?.clues?.[currentClueIndex];
    const [location, setLocation] = useState(null);
    const [heading, setHeading] = useState(0);
    const [distance, setDistance] = useState(null);
    const [hasReached, setHasReached] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [currentHint, setCurrentHint] = useState('');
    const [loading, setLoading] = useState(true);
    const [showTreasureAnimation, setShowTreasureAnimation] = useState(false);
    const [showClueInfo, setShowClueInfo] = useState(true);

    // Boolean Variable To Stop Repeated Alerts
    const [clueCompletedFlag, setClueCompletedFlag] = useState(false);
    
    // Add states for side quest functionality
    const [taskActive, setTaskActive] = useState(false);
    const [currentTask, setCurrentTask] = useState('');
    const [showTask, setShowTask] = useState(false);
    const [taskAccepted, setTaskAccepted] = useState(false);
    
    // New states for hunt completion
    const [huntCompleted, setHuntCompleted] = useState(false);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    
    const treasureAnimationRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(0.5)).current;
    const mapRef = useRef(null);
    const boyBounceAnim = useRef(new Animated.Value(0)).current;

    const [showHistoricModal, setShowHistoricModal] = useState(false);

    // Check if hunt is completed (index out of bounds)
    useEffect(() => {
        if (activeHunt && activeHunt.clues && currentClueIndex >= activeHunt.clues.length) {
            setHuntCompleted(true);
            Alert.alert(
                '🏆 Hunt Completed!', 
                'Congratulations! You have found all the clues and completed this treasure hunt!',
                [{ text: 'View Badge', onPress: () => setShowBadgeModal(true) }]
            );
        }
    }, [currentClueIndex, activeHunt]);

    // Function to calculate distance between two coordinates in meters
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };
    
    const handleUnlockClue = async() => {
        try {
            const {status} = await solveClue();
            if(status === 200) {
                
            } else {
                console.log('Error in  solving Clue');
            }
            setClueCompletedFlag(false);
                setHasReached(false);
        } catch (error) {
            console.log('Error solving clue:', error);
        }
        
    }

    // Start pulse animation for active clue marker
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Start bounce animation for 3D boy character
        Animated.loop(
            Animated.sequence([
                Animated.timing(boyBounceAnim, {
                    toValue: -5,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(boyBounceAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        let locationSubscription = null;
        let headingSubscription = null;
        
        const setupLocationAndHeading = async () => {
            try {
                // Request location permissions
                const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                
                if (locationStatus !== 'granted') {
                    Alert.alert('Permission denied', 'Location permission is required to show your position on the map.');
                    return;
                }

                // Get initial location
                const initialPosition = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                
                const userLocation = {
                    latitude: initialPosition.coords.latitude,
                    longitude: initialPosition.coords.longitude,
                };
                
                setLocation(userLocation);
                setLoading(false);
                
                // Calculate initial distance if hunt is not completed and clue coordinates exist
                if (!clueCompletedFlag && !huntCompleted && currentClue?.latitue && currentClue?.longitue) {
                    const distanceInMeters = calculateDistance(
                        userLocation.latitude, 
                        userLocation.longitude,
                        currentClue.latitue,
                        currentClue.longitue
                    );
                    setDistance(distanceInMeters);
                    
                    // Check if user has reached the clue location
                    if (!clueCompletedFlag && distanceInMeters < 60 && !hasReached) {
                        setHasReached(true);
                        setClueCompletedFlag(true);
                        // Updated message to focus on the historical significance
                        // Alert.alert(
                        //     '📜 Historic Location Found', 
                        //     `You've discovered ${currentClue.history || 'a place with historical significance'}!`, 
                        //     [{ text: 'Unlock Next Clue', onPress: () => {handleUnlockClue()} }]
                        // );
                        setShowHistoricModal(true);

                    }
                }

                // Only track location if hunt is not completed
                if (!clueCompletedFlag && !huntCompleted) {
                    // Set up continuous location tracking
                    locationSubscription = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.High,
                            distanceInterval: 5, // minimum distance (in meters) between position updates
                            timeInterval: 1000,   // minimum time (in ms) between position updates
                        },
                        (newLocation) => {
                            const updatedLocation = {
                                latitude: newLocation.coords.latitude,
                                longitude: newLocation.coords.longitude,
                            };
                            
                            setLocation(updatedLocation);
                            
                            // Update distance calculation if clue coordinates exist
                            if (!clueCompletedFlag && currentClue?.latitue && currentClue?.longitue) {
                                const distanceInMeters = calculateDistance(
                                    updatedLocation.latitude, 
                                    updatedLocation.longitude,
                                    currentClue.latitue,
                                    currentClue.longitue
                                );
                                setDistance(distanceInMeters);
                                
                                // Check if user has reached the clue location
                                if (!clueCompletedFlag && distanceInMeters < 60 && !hasReached) {
                                    setHasReached(true);
                                    setClueCompletedFlag(true);
                                    // Updated message to focus on the historical significance
                                    // Alert.alert(
                                    //     '📜 Historic Location Found', 
                                    //     `You've discovered ${currentClue.history || 'a place with historical significance'}!`, 
                                    //     [{ text: 'Unlock Next Clue', onPress: () => {handleUnlockClue()} }]
                                    // );
                                    setShowHistoricModal(true);
                                }
                            }
                        }
                    );
                }
                
                // Start watching for compass heading changes
                headingSubscription = await Location.watchHeadingAsync((headingData) => {
                    const newHeading = headingData.trueHeading || headingData.magHeading;
                    setHeading(newHeading);
                });
                
            } catch (error) {
                Alert.alert('Error', 'Failed to get your current location or device orientation.');
                console.log('Setup error:', error);
                setLoading(false);
            }
        };

        setupLocationAndHeading();

        // Clean up subscriptions when component unmounts
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
            if (headingSubscription) {
                headingSubscription.remove();
            }
        };
    }, [currentClue, huntCompleted]);

    // Function to fetch side quest task
    const fetchSideQuest = async () => {
        if (!location || !currentClue || huntCompleted) return;
        
        try {
            // If a task is already accepted but not completed, show it again
            if (taskAccepted && currentTask) {
                setShowTask(true);
                return;
            }
            
            // Otherwise fetch a new task
            const res = await axios.post(
                'https://bba7-2409-40e3-2005-6ba2-3101-4ad1-ba3c-5d41.ngrok-free.app/api/tasks/suggestTasks',
                {
                    userLat: location.latitude,
                    userLong: location.longitude,
                    clueLat: currentClue.latitue,
                    clueLong: currentClue.longitue
                }
            );
            
            if (res.data?.task) {
                setCurrentTask(res.data.task);
                setShowTask(true);
            } else {
                Alert.alert('No Side Quest', 'No side quests available at this time.');
            }
        } catch (err) {
            console.log('Task fetch failed:', err.message);
            Alert.alert('Error', 'Failed to fetch side quest.');
        }
    };

    // Handle accepting side quest
    const acceptSideQuest = () => {
        setTaskAccepted(true);
        setShowTask(false);
    };

    // Handle side quest completion
    const completeSideQuest = () => {
        setTaskAccepted(false);
        setCurrentTask('');
        setShowTask(false);
        Alert.alert('Side Quest Complete', 'Congratulations! You completed the side quest.');
    };

    // Handle hint system
    const handleHint = () => {
        if (huntCompleted) return;
        
        setShowHint(true);
        const allHints = currentClue?.hints || [];
        if (allHints.length > 0) {
            const random = Math.floor(Math.random() * allHints.length);
            setCurrentHint(allHints[random].description);
        } else {
            setCurrentHint('No hint available.');
        }
    };

    // Handle opening the treasure chest and showing animation
    // const handleOpenChest = () => {
    //     setShowTreasureAnimation(true);
        
    //     // After animation starts, call solveClue
    //     setTimeout(() => {
            
            
    //         // After animation completes, hide it
    //         setTimeout(() => {
    //             setShowTreasureAnimation(false);
    //             setHasReached(false);
    //         }, 3000);
    //     }, 500);
    // };

    // Handle showing the badge modal
    const toggleBadgeModal = () => {
        setShowBadgeModal(!showBadgeModal);
    };

    // Handle toggle for ClueInfoPanel
    const toggleClueInfo = () => {
        setShowClueInfo(prevState => !prevState);
    };

    // Custom 3D Boy UserLocationRender Component
    const Boy3DUserLocationRender = () => {
        return (
            <Animated.View 
                style={[
                    styles.boyContainer,
                    { transform: [
                        { translateY: boyBounceAnim },
                        { rotate: `${heading}deg` }
                    ]}
                ]}
            >
                <View style={styles.boyShadow} />
                <Image 
                    source={require('../../assets/images/3d-boy-character.png')} 
                    style={styles.boyImage}
                    resizeMode="contain"
                />
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading treasure map...</Text>
            </View>
        );
    }

    if (showTreasureAnimation) {
        return (
            <View style={styles.treasureAnimationContainer}>
                <LottieView
                    ref={treasureAnimationRef}
                    source={require('../../assets/animations/treasure-chest.json')}
                    style={styles.treasureAnimation}
                    autoPlay
                    loop={false}
                />
                <Text style={styles.treasureText}>Treasure Found!</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <View style={styles.container}>
                <Mapbox.MapView 
                    ref={mapRef}
                    style={styles.map}
                    styleURL="mapbox://styles/fourhaan/cm9oopm5p00a301sbhevh49ca/draft"
                    compassEnabled={true}
                >
                    {/* Camera using manual update approach instead of followUserLocation */}
                    {location && (
                        <Mapbox.Camera
                            zoomLevel={huntCompleted ? 15 : 20}
                            pitch={huntCompleted ? 45 : 75}
                            heading={heading}
                            centerCoordinate={[location.longitude, location.latitude]}
                            animationMode="easeTo"
                            animationDuration={300}
                        />
                    )}
                    
                    {/* Destination marker - yellow (only if hunt is not completed) */}
                    {!huntCompleted && currentClue?.latitue && currentClue?.longitue && (
                        <Mapbox.PointAnnotation
                            id="destinationLocation"
                            coordinate={[currentClue.longitue, currentClue.latitue]}
                        >
                            <Animated.View
                                style={[
                                    styles.destinationMarker,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}
                            >
                                <View style={styles.destinationMarkerCore}>
                                    <FontAwesome5 name="question" size={12} color="black" />
                                </View>
                            </Animated.View>
                        </Mapbox.PointAnnotation>
                    )}
                    
                    {/* Previous Clues - shown both during hunt and after completion */}
                    {activeHunt?.clues.map((clue, idx) => {
                        // Show all solved clues when hunt is completed, or only previous clues during active hunt
                        if (huntCompleted || idx < currentClueIndex) {
                            return (
                                <Mapbox.PointAnnotation
                                    key={`clue-${idx}`}
                                    id={`clue-${idx}`}
                                    coordinate={[clue.longitue, clue.latitue]}
                                >
                                    <View style={styles.solvedClueMarker}>
                                        <FontAwesome5 name="check" size={12} color="white" />
                                    </View>
                                </Mapbox.PointAnnotation>
                            );
                        }
                        return null;
                    })}
                    
                    {/* 3D Boy character as user location */}
                    {location && (
                        <Mapbox.PointAnnotation
                            id="userLocation"
                            coordinate={[location.longitude, location.latitude]}
                            anchor={{ x: 0.5, y: 1.0 }}
                        >
                            <Boy3DUserLocationRender />
                        </Mapbox.PointAnnotation>
                    )}
                </Mapbox.MapView>
            </View>
            
            {/* Clue Info Panel - show only if showClueInfo is true and hunt is not completed */}
            {showClueInfo && !huntCompleted && currentClue && (
                <View style={styles.clueInfoPanel}>
                    <Text style={styles.clueTitle}>
                        Clue {currentClueIndex + 1} of {activeHunt?.numberOfClues || 0}
                    </Text>
                    <Text style={styles.clueDescription}>
                        {currentClue?.description || "Find this location"}
                    </Text>
                    {distance && (
                        <Text style={styles.distanceText}>
                            {distance < 1000 
                                ? `${Math.round(distance)} meters away` 
                                : `${(distance / 1000).toFixed(1)} km away`}
                        </Text>
                    )}
                </View>
            )}

            {/* Historic Location Modal */}
            <Modal
            animationType="fade"
            transparent={true}
            visible={showHistoricModal}
            onRequestClose={() => setShowHistoricModal(false)}
            >
            <View style={styles.modalOverlay}>
                <View style={styles.alertModalContent}>
                {/* Close button */}
                <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowHistoricModal(false)}
                >
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                
                <Text style={styles.alertTitle}>
                    📜 Historic Location Found
                </Text>
                <Text style={styles.alertMessage}>
                    You've discovered {currentClue?.history || 'a place with historical significance'}!
                </Text>
                <TouchableOpacity 
                    style={styles.alertActionButton}
                    onPress={() => {
                    handleUnlockClue();
                    setShowHistoricModal(false);
                    }}
                >
                    <Text style={styles.alertButtonText}>Unlock Next Clue</Text>
                </TouchableOpacity>
                </View>
            </View>
            </Modal>
            
            {/* Hunt Completed Info Panel */}
            {huntCompleted && (
                <View style={styles.huntCompletedPanel}>
                    <Text style={styles.huntCompletedTitle}>
                        🏆 Hunt Completed!
                    </Text>
                    <Text style={styles.huntCompletedDescription}>
                        You've found all {activeHunt?.numberOfClues || 0} clues and completed this treasure hunt!
                    </Text>
                </View>
            )}
            
            {/* Badge Button - only shown when hunt is completed */}
            {huntCompleted && (
                <TouchableOpacity
                    style={styles.badgeButton}
                    onPress={toggleBadgeModal}
                >
                    <FontAwesome name="trophy" size={30} color="gold" />
                </TouchableOpacity>
            )}
            
            {/* Control Panel */}
            <View style={styles.controlPanel}>
                <TouchableOpacity 
                    style={[
                        styles.controlButton, 
                        styles.toggleClueButton,
                        huntCompleted && styles.disabledButton
                    ]} 
                    onPress={toggleClueInfo}
                    disabled={huntCompleted}
                >
                    <Ionicons 
                        name={showClueInfo ? "eye-off" : "eye"} 
                        size={24} 
                        color={huntCompleted ? "gray" : "white"} 
                    />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.controlButton, 
                        styles.hintButton,
                        huntCompleted && styles.disabledButton
                    ]} 
                    onPress={handleHint}
                    disabled={huntCompleted}
                >
                    <Ionicons 
                        name="bulb-outline" 
                        size={24} 
                        color={huntCompleted ? "gray" : "white"} 
                    />
                </TouchableOpacity>
                
                {/* Side Quest Button */}
                <TouchableOpacity 
                    style={[
                        styles.controlButton, 
                        styles.sideQuestButton,
                        taskAccepted && styles.activeQuestButton,
                        huntCompleted && styles.disabledButton
                    ]} 
                    onPress={fetchSideQuest}
                    disabled={huntCompleted}
                >
                    <MaterialCommunityIcons 
                        name={taskAccepted ? "sword" : "sword-cross"} 
                        size={24} 
                        color={huntCompleted ? "gray" : "white"} 
                    />
                </TouchableOpacity>
                
                {/* Open Chest Button - only shown when hasReached and not hunting is completed
                {hasReached && !huntCompleted && (
                    <TouchableOpacity 
                        style={[styles.controlButton, styles.chestButton]} 
                        onPress={handleOpenChest}
                    >
                        <MaterialCommunityIcons name="treasure-chest" size={24} color="white" />
                    </TouchableOpacity>
                )} */}
            </View>
            
            {/* Hint Popup */}
            {showHint && (
                <View style={styles.hintPopup}>
                    <Text style={styles.hintHeader}>💡 Hint</Text>
                    <Text style={styles.hintText}>{currentHint}</Text>
                    <TouchableOpacity 
                        style={styles.dismissButton} 
                        onPress={() => setShowHint(false)}
                    >
                        <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            {/* Side Quest Popup */}
            {showTask && (
                <View style={styles.sideQuestPopup}>
                    <Text style={styles.sideQuestHeader}>⚔️ Side Quest</Text>
                    <Text style={styles.sideQuestText}>{currentTask}</Text>
                    
                    <View style={styles.sideQuestButtonsContainer}>
                        {taskAccepted ? (
                            <TouchableOpacity 
                                style={styles.sideQuestActionButton} 
                                onPress={completeSideQuest}
                            >
                                <Text style={styles.sideQuestButtonText}>Mark as Solved</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity 
                                    style={[styles.sideQuestActionButton, styles.acceptButton]} 
                                    onPress={acceptSideQuest}
                                >
                                    <Text style={styles.sideQuestButtonText}>Accept</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.sideQuestActionButton, styles.declineButton]} 
                                    onPress={() => setShowTask(false)}
                                >
                                    <Text style={styles.sideQuestButtonText}>Decline</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            )}
            
            {/* Badge Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showBadgeModal}
                onRequestClose={toggleBadgeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.badgeModalContent}>
                        <FontAwesome name="trophy" size={100} color="gold" />
                        <Text style={styles.badgeTitle}>
                            Hunt Master
                        </Text>
                        <Text style={styles.badgeDescription}>
                            You've successfully completed "{activeHunt?.name || 'this treasure hunt'}"!
                        </Text>
                        <TouchableOpacity 
                            style={styles.closeBadgeButton}
                            onPress={toggleBadgeModal}
                        >
                            <Text style={styles.closeBadgeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default ActiveRiddleScreen;

const styles = StyleSheet.create({
    page: {
        flex: 1,
        position: 'relative',
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    loadingText: {
        fontSize: 18,
        color: '#333'
    },
    map: {
        flex: 1
    },
    // 3D Boy Character styles
    boyContainer: {
        width: 50,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    boyImage: {
        width: 50,
        height: 70,
        position: 'absolute',
        bottom: 0,
    },
    boyShadow: {
        width: 30,
        height: 15,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        position: 'absolute',
        bottom: -5,
    },
    // Original marker styles kept for reference
    locationMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationMarkerCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    },
    destinationMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    destinationMarkerCore: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'yellow',
        justifyContent: 'center',
        alignItems: 'center',
    },
    solvedClueMarker: {
        width: 24,
        height: 24,
        backgroundColor: 'green',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    clueInfoPanel: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    clueTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333'
    },
    clueDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5
    },
    distanceText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: 'bold'
    },
    // Hunt completed panel styles
    huntCompletedPanel: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    huntCompletedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'white',
        textAlign: 'center'
    },
    huntCompletedDescription: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center'
    },
    // Badge button style
    badgeButton: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'gold'
    },
    controlPanel: {
        position: 'absolute',
        right: 20,
        bottom: 100,
        flexDirection: 'column',
        alignItems: 'center'
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    disabledButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    hintButton: {
        backgroundColor: '#FF9800'
    },
    // Chest button style
    chestButton: {
        backgroundColor: '#DAA520' // Gold color for treasure chest
    },
    // Side quest button styles
    sideQuestButton: {
        backgroundColor: '#673AB7' // Purple for side quests
    },
    activeQuestButton: {
        backgroundColor: '#9C27B0', // Different purple when quest is active
        borderWidth: 2,
        borderColor: 'white'
    },
    toggleClueButton: {
        backgroundColor: '#2196F3'
    },
    hintPopup: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5
    },
    hintHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    hintText: {
        fontSize: 16,
        marginBottom: 15,
        color: '#555',
        lineHeight: 22
    },
    dismissButton: {
        alignSelf: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    dismissText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: 'bold'
    },
   // Side quest popup styles
   sideQuestPopup: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
},
sideQuestHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
},
sideQuestText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
    lineHeight: 22
},
sideQuestButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
},
sideQuestActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#673AB7',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
},
acceptButton: {
    backgroundColor: '#4CAF50'
},
declineButton: {
    backgroundColor: '#F44336'
},
sideQuestButtonText: {
    color: 'white',
    fontWeight: 'bold'
},
// Treasure animation styles
treasureAnimationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)'
},
treasureAnimation: {
    width: 300,
    height: 300
},
treasureText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'gold',
    marginTop: 20
},
// Badge modal styles
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
},
badgeModalContent: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
},
badgeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10
},
badgeDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20
},
closeBadgeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8
},
closeBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
},
alertModalContent: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center'
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20
  },
  alertActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center'
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});