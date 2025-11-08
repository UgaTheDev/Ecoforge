import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon: string;
  color: string;
}

const { width, height } = Dimensions.get('window');

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  title,
  message,
  icon,
  color,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  
  // Confetti animations
  const confetti = useRef(
    Array.from({ length: 15 }, () => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(-50)).current,
      rotate: useRef(new Animated.Value(0)).current,
      scale: useRef(new Animated.Value(0)).current,
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Modal entrance
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Icon rotation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Confetti animation
      confetti.forEach((item, index) => {
        Animated.parallel([
          Animated.timing(item.y, {
            toValue: height + 100,
            duration: 3000 + Math.random() * 2000,
            delay: index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(item.rotate, {
            toValue: Math.random() > 0.5 ? 360 : -360,
            duration: 2000 + Math.random() * 1000,
            delay: index * 100,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(item.scale, {
              toValue: 1,
              duration: 200,
              delay: index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(item.scale, {
              toValue: 0,
              duration: 300,
              delay: 2500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    } else {
      scaleValue.setValue(0);
      fadeValue.setValue(0);
      confetti.forEach(item => {
        item.y.setValue(-50);
        item.scale.setValue(0);
      });
    }
  }, [visible]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const confettiColors = ['#fbbf24', '#10b981', '#3b82f6', '#f472b6', '#8b5cf6', '#ef4444'];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti */}
        {confetti.map((item, index) => {
          const confettiRotate = item.rotate.interpolate({
            inputRange: [-360, 360],
            outputRange: ['-360deg', '360deg'],
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  backgroundColor: confettiColors[index % confettiColors.length],
                  transform: [
                    { translateX: item.x },
                    { translateY: item.y },
                    { rotate: confettiRotate },
                    { scale: item.scale },
                  ],
                },
              ]}
            />
          );
        })}

        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeValue,
              transform: [{ scale: scaleValue }]
            }
          ]}
        >
          <View style={styles.card}>
            <LinearGradient 
              colors={[color, color + 'dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name={icon as any} size={72} color="#fff" />
              </Animated.View>
              
              {/* Glow effect */}
              <View style={[styles.glow, { backgroundColor: color }]} />
            </LinearGradient>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <TouchableOpacity 
              style={styles.button} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[color, color + 'dd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Awesome!</Text>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default CelebrationModal;
