import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Challenge } from '../types/gamification';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const progress = Math.min((challenge.progress / challenge.goal) * 100, 100);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Pulse animation for completed challenges
    if (challenge.completed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [progress, challenge.completed]);

  const timeLeft = getTimeLeft(challenge.endDate);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[styles.container, challenge.completed && { transform: [{ scale: pulseAnim }] }]}>
        {challenge.completed && (
          <View style={styles.completedBanner}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completedBannerGradient}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.completedText}>Completed!</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.header}>
          <LinearGradient
            colors={[challenge.color, challenge.color + 'dd']}
            style={styles.iconContainer}
          >
            <Ionicons name={challenge.icon as any} size={28} color="#fff" />
          </LinearGradient>
          <View style={styles.info}>
            <Text style={styles.name}>{challenge.name}</Text>
            <Text style={styles.description}>{challenge.description}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFillContainer, { width: progressWidth }]}>
              <LinearGradient
                colors={[challenge.color, challenge.color + 'aa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressFill}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>
            <Text style={[styles.progressCurrent, { color: challenge.color }]}>
              {challenge.progress}
            </Text>
            {' / '}{challenge.goal}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.reward}>
            <View style={styles.rewardIcon}>
              <Ionicons name="star" size={14} color="#f59e0b" />
            </View>
            <Text style={styles.rewardText}>+{challenge.reward} pts</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#94a3b8" />
            <Text style={styles.timeLeft}>{timeLeft}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const getTimeLeft = (endDate: Date): string => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m left`;
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  completedBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
  },
  completedBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFillContainer: {
    height: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
    fontWeight: '600',
  },
  progressCurrent: {
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  rewardIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLeft: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default ChallengeCard;
