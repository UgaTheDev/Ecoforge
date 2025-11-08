import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Challenge } from '../types/gamification';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const progress = Math.min((challenge.progress / challenge.goal) * 100, 100);
  const timeLeft = getTimeLeft(challenge.endDate);

  return (
    <View style={[styles.container, challenge.completed && styles.completed]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: challenge.color }]}>
          <Ionicons name={challenge.icon as any} size={24} color="#fff" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{challenge.name}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>
        {challenge.completed && (
          <Ionicons name="checkmark-circle" size={32} color="#10b981" />
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: challenge.color }]} />
        </View>
        <Text style={styles.progressText}>
          {challenge.progress} / {challenge.goal}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.reward}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.rewardText}>+{challenge.reward} pts</Text>
        </View>
        <Text style={styles.timeLeft}>{timeLeft}</Text>
      </View>
    </View>
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
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completed: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  timeLeft: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default ChallengeCard;
