import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, longestStreak }) => {
  return (
    <LinearGradient
      colors={currentStreak > 0 ? ['#f97316', '#dc2626'] : ['#94a3b8', '#64748b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons name="flame" size={40} color="#fff" />
        <View style={styles.textContainer}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>
      <Text style={styles.longest}>Longest: {longestStreak} days</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textContainer: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  longest: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    opacity: 0.8,
  },
});

export default StreakDisplay;
