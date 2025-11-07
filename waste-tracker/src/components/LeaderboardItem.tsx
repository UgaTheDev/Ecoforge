import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LeaderboardEntry } from '../types';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ entry, isCurrentUser }) => {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#cd7f32';
    return '#e2e8f0';
  };

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUser]}>
      <View style={styles.rankContainer}>
        {entry.rank <= 3 ? (
          <Ionicons name="trophy" size={24} color={getMedalColor(entry.rank)} />
        ) : (
          <Text style={styles.rankText}>{entry.rank}</Text>
        )}
      </View>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {entry.user.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.username}>{entry.user.username}</Text>
        <Text style={styles.waste}>{entry.totalWaste} kg logged</Text>
      </View>

      <View style={styles.pointsContainer}>
        <Ionicons name="star" size={20} color="#f59e0b" />
        <Text style={styles.points}>{entry.points}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUser: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  waste: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});

export default LeaderboardItem;
