import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useWaste } from '../contexts/WasteContext';
import { wasteService } from '../services/wasteService';
import { WasteType } from '../types';
import { getWasteTypeColor } from '../utils/wasteColors';

const CameraScreen = ({ navigation }: any) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [description, setDescription] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const { user } = useAuth();
  const { addWasteEntry } = useWaste();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="#cbd5e1" />
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setCapturedImage(photo.uri);
        analyzeImage(photo.uri);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      const result = await wasteService.analyzeWaste(imageUri);
      setAnalysis(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const submitWaste = async () => {
    if (!analysis || !user || !capturedImage) return;

    const points = wasteService.calculatePoints(analysis.wasteType, analysis.quantity);

    try {
      await addWasteEntry({
        userId: user.id,
        username: user.username,
        imageUri: capturedImage,
        wasteType: analysis.wasteType,
        quantity: analysis.estimatedWeight,
        points,
        description: description || undefined,
      });

      Alert.alert(
        'Success!',
        `You earned ${points} points for logging ${analysis.estimatedWeight} kg of ${analysis.wasteType}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCapturedImage(null);
              setAnalysis(null);
              setDescription('');
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit waste entry. Please try again.');
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setDescription('');
  };

  if (capturedImage) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.reviewContainer}>
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
        </View>

        {analyzing ? (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.analyzingText}>Analyzing waste...</Text>
          </View>
        ) : analysis ? (
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Analysis Results</Text>

            <View style={[styles.wasteTypeBadge, { backgroundColor: getWasteTypeColor(analysis.wasteType) }]}>
              <Text style={styles.wasteTypeText}>{analysis.wasteType}</Text>
              <Text style={styles.confidenceText}>
                {Math.round(analysis.confidence * 100)}% confidence
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="scale-outline" size={24} color="#64748b" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Estimated Weight</Text>
                  <Text style={styles.detailValue}>{analysis.estimatedWeight} kg</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="star" size={24} color="#f59e0b" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Points to Earn</Text>
                  <Text style={styles.detailValue}>
                    {wasteService.calculatePoints(analysis.wasteType, analysis.quantity)} pts
                  </Text>
                </View>
              </View>
            </View>

            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a note (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#94a3b8"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.retakeButton} onPress={retake}>
                <Ionicons name="refresh" size={20} color="#10b981" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={submitWaste}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraOverlay}>
          <View style={styles.guidanceBox}>
            <Text style={styles.guidanceText}>
              Position waste in the frame
            </Text>
          </View>
        </View>

        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Ionicons name="images" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <Ionicons name="camera-reverse" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceBox: {
    borderWidth: 3,
    borderColor: '#10b981',
    borderRadius: 20,
    width: 300,
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
  },
  guidanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10b981',
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewContainer: {
    padding: 20,
    paddingTop: 60,
  },
  imagePreviewContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 400,
    backgroundColor: '#1e293b',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  analyzingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  analysisContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  wasteTypeBadge: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  wasteTypeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  confidenceText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  detailsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  descriptionInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CameraScreen;
