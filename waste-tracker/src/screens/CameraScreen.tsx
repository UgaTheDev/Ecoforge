import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useWaste } from '../contexts/WasteContext';
import { wasteService } from '../services/wasteService';

const CameraScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addWasteEntry } = useWaste();

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

      Alert.alert(
        'Success!',
        `You earned ${points} points!`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Waste</Text>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="camera" size={80} color="#10b981" />
        <Text style={styles.text}>Take a photo of your waste</Text>
        
        <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Choose Photo'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;
