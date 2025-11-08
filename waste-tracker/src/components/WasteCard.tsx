import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WasteEntry } from '../types';
import { getWasteTypeColor, getWasteTypeIcon } from '../utils/wasteColors';
import { formatDate } from '../utils/dateUtils';

interface WasteCardProps {
  entry: WasteEntry;
  onPress?: () => void;
  index?: number;
}

const WasteCard: React.FC<WasteCardProps> = ({ entry, onPress, index = 0 }) => {
  const color = getWasteTypeColor(entry.wasteType);
  const iconName = getWasteTypeIcon(entry.wasteType) as keyof typeof Ionicons.glyphMap;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: entry.imageUri }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <LinearGradient
              colors={[color, color + 'dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.typeBadge}
            >
              <Ionicons name={iconName} size={16} color="#fff" />
              <Text style={styles.typeText}>{entry.wasteType}</Text>
            </LinearGradient>
            <Text style={styles.time}>{formatDate(entry.timestamp)}</Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <View style={styles.statIcon}>
                <Ionicons name="scale-outline" size={16} color="#10b981" />
              </View>
              <Text style={styles.statText}>{entry.quantity} kg</Text>
            </View>
            <View style={styles.stat}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={16} color="#f59e0b" />
              </View>
              <Text style={styles.statText}>{entry.points} pts</Text>
            </View>
          </View>

          {entry.description && (
            <Text style={styles.description} numberOfLines={2}>
              {entry.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f5f9',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default WasteCard;
