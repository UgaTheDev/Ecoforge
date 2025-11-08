import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '../types/gamification';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (badge.earned) {
      // Shimmer effect for earned badges
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [badge.earned]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.card, !badge.earned && styles.locked]}>
        {badge.earned ? (
          <LinearGradient
            colors={[badge.color, badge.color + 'dd']}
            style={styles.iconContainer}
          >
            <Ionicons name={badge.icon as any} size={36} color="#fff" />
            
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />
          </LinearGradient>
        ) : (
          <View style={[styles.iconContainer, styles.lockedIcon]}>
            <Ionicons name={badge.icon as any} size={36} color="#cbd5e1" />
          </View>
        )}
        
        <Text style={[styles.name, !badge.earned && styles.lockedText]} numberOfLines={1}>
          {badge.name}
        </Text>
        <Text style={[styles.description, !badge.earned && styles.lockedText]} numberOfLines={2}>
          {badge.description}
        </Text>
        
        {badge.earned && badge.earnedDate && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#10b981" />
            <Text style={styles.earnedDate}>
              {new Date(badge.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        )}
        
        {!badge.earned && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color="#94a3b8" />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedIcon: {
    backgroundColor: '#f1f5f9',
  },
  shimmer: {
    position: 'absolute',
    width: 30,
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 15,
  },
  lockedText: {
    color: '#cbd5e1',
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  earnedDate: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f1f5f9',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BadgeCard;
