import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../types/gamification';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  return (
    <View style={[styles.container, !badge.earned && styles.locked]}>
      <View style={[styles.iconContainer, { backgroundColor: badge.earned ? badge.color : '#e2e8f0' }]}>
        <Ionicons 
          name={badge.icon as any} 
          size={32} 
          color={badge.earned ? '#fff' : '#94a3b8'} 
        />
      </View>
      <Text style={[styles.name, !badge.earned && styles.lockedText]} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text style={[styles.description, !badge.earned && styles.lockedText]} numberOfLines={2}>
        {badge.description}
      </Text>
      {badge.earned && badge.earnedDate && (
        <Text style={styles.earnedDate}>
          {new Date(badge.earnedDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },
  lockedText: {
    color: '#94a3b8',
  },
  earnedDate: {
    fontSize: 10,
    color: '#10b981',
    marginTop: 4,
  },
});

export default BadgeCard;
