import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useWaste } from '../contexts/WasteContext';
import { useGamification } from '../contexts/GamificationContext';
import { wasteService } from '../services/wasteService';
import CelebrationModal from '../components/CelebrationModal';

const CameraScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState({
    title: '',
    message: '',
    icon: 'checkmark-circle',
    color: '#10b981',
  });
  
  const { user } = useAuth();
  const { addWasteEntry, wasteEntries } = useWaste();
  const { checkProgress, refreshGamification } = useGamification();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      analyzeAndSubmit(result.assets[0].uri);
    }
  };

  const analyzeAndSubmit = async (imageUri: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const analysis = await wasteService.analyzeWaste(imageUri);
      const points = wasteService.calculatePoints(analysis.wasteType, analysis.quantity);

      await addWasteEntry({
        userId: user.id,
        username: user.username,
        imageUri,
        wasteType: analysis.wasteType,
        quantity: analysis.estimatedWeight,
        points,
      });

      // Check gamification progress
      const newTotalEntries = wasteEntries.length + 1;
      const newTotalPoints = wasteEntries.reduce((sum, e) => sum + e.points, 0) + points;
      
      const { newBadges, completedChallenges, streakIncreased } = await checkProgress(
        newTotalEntries,
        newTotalPoints
      );

      await refreshGamification();

      // Show celebration
      showCelebration(points, newBadges, completedChallenges, streakIncreased);

    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const showCelebration = (points: number, newBadges: any[], completedChallenges: any[], streakIncreased: boolean) => {
    let title = 'Great Job!';
    let message = `You earned ${points} points!`;
    let icon = 'checkmark-circle';
    let color = '#10b981';

    if (newBadges.length > 0) {
      title = '🎉 New Badge Unlocked!';
      message = `You earned "${newBadges[0].name}"! Plus ${points} points!`;
      icon = newBadges[0].icon;
      color = newBadges[0].color;
    } else if (streakIncreased) {
      title = '🔥 Streak Extended!';
      message = `Keep it going! +${points} points`;
      icon = 'flame';
      color = '#f97316';
    } else if (completedChallenges.length > 0) {
      title = '✨ Challenge Complete!';
      message = `${completedChallenges[0].name} done! +${points + completedChallenges[0].reward} points total!`;
      icon = 'trophy';
      color = '#f59e0b';
    }

    setCelebrationData({ title, message, icon, color });
    setCelebrationVisible(true);
  };

  const handleCelebrationClose = () => {
    setCelebrationVisible(false);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Waste</Text>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="camera" size={80} color="#10b981" />
        <Text style={styles.text}>Take a photo of your waste</Text>
        <Text style={styles.subtext}>Build your streak! 🔥</Text>
        
        <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
          <Ionicons name="images" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Choose Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      <CelebrationModal
        visible={celebrationVisible}
        onClose={handleCelebrationClose}
        title={celebrationData.title}
        message={celebrationData.message}
        icon={celebrationData.icon}
        color={celebrationData.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 20,
  },
  subtext: {
    fontSize: 16,
    color: '#f97316',
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;
