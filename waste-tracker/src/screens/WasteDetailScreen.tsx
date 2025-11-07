import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WasteEntry } from '../types';
import { getWasteTypeColor } from '../utils/wasteColors';
import { formatFullDate } from '../utils/dateUtils';

const WasteDetailScreen = ({ route, navigation }: any) => {
  const { entry }: { entry: WasteEntry } = route.params;
  const color = getWasteTypeColor(entry.wasteType);

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: entry.imageUri }} style={styles.image} />

      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{entry.wasteType}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="scale-outline" size={32} color="#64748b" />
            <Text style={styles.statValue}>{entry.quantity} kg</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="star" size={32} color="#f59e0b" />
            <Text style={styles.statValue}>{entry.points}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Logged by</Text>
            <Text style={styles.infoValue}>{entry.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatFullDate(entry.timestamp)}</Text>
          </View>

          {entry.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {entry.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Notes</Text>
            <Text style={styles.descriptionText}>{entry.description}</Text>
          </View>
        )}

        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>Environmental Impact</Text>
          <Text style={styles.impactText}>
            By properly disposing of this waste, you're helping reduce environmental
            pollution and contributing to a more sustainable future. Great work!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#1e293b',
  },
  content: {
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 2,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  impactSection: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
});

export default WasteDetailScreen;
