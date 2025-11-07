import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WasteEntry } from '../types';
import { getWasteTypeColor, getWasteTypeIcon } from '../utils/wasteColors';
import { formatDate } from '../utils/dateUtils';

interface WasteCardProps {
  entry: WasteEntry;
  onPress?: () => void;
}

const WasteCard: React.FC<WasteCardProps> = ({ entry, onPress }) => {
  const color = getWasteTypeColor(entry.wasteType);
  const iconName = getWasteTypeIcon(entry.wasteType) as keyof typeof Ionicons.glyphMap;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: entry.imageUri }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: color }]}>
            <Ionicons name={iconName} size={16} color="#fff" />
            <Text style={styles.typeText}>{entry.wasteType}</Text>
          </View>
          <Text style={styles.time}>{formatDate(entry.timestamp)}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="scale-outline" size={18} color="#64748b" />
            <Text style={styles.statText}>{entry.quantity} kg</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="star" size={18} color="#f59e0b" />
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
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default WasteCard;
