import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, longestStreak }) => {
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentStreak > 0) {
      // Flame animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(flameScale, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(flameRotate, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(flameScale, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(flameRotate, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [currentStreak]);

  const rotate = flameRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const isActive = currentStreak > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isActive ? ['#ff6b35', '#f7931e', '#fdc830'] : ['#94a3b8', '#64748b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background decoration */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.flameContainer,
              {
                transform: [{ scale: flameScale }, { rotate }]
              }
            ]}
          >
            <Ionicons name="flame" size={48} color="#fff" />
          </Animated.View>
          <View style={styles.textContainer}>
            <View style={styles.streakRow}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.dayText}>day{currentStreak !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.longestContainer}>
            <Ionicons name="trophy" size={16} color="#fff" style={{ opacity: 0.8 }} />
            <Text style={styles.longest}>Best: {longestStreak} days</Text>
          </View>
          {isActive && (
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    zIndex: 1,
  },
  flameContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dayText: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
  },
  streakLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  longestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  longest: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  decorCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 200,
  },
  decorCircle1: {
    width: 150,
    height: 150,
    top: -50,
    right: -40,
  },
  decorCircle2: {
    width: 100,
    height: 100,
    bottom: -30,
    left: -20,
  },
  decorCircle3: {
    width: 80,
    height: 80,
    top: 40,
    right: -20,
    opacity: 0.5,
  },
});

export default StreakDisplay;
