import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWaste } from '../contexts/WasteContext';
import { useAuth } from '../contexts/AuthContext';

const GARBAGE_LAYER_COLORS = ['#4B5563', '#6B7280', '#94A3B8', '#475569', '#334155', '#1F2937'];
type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;
const GARBAGE_ICON_SET: MaterialIconName[] = [
  'trash-can',
  'bottle-soda',
  'food-drumstick',
  'cup',
  'recycle',
  'fish',
  'newspaper-variant',
];

const layerWeightStep = 5; // every 5 units stacked as a new trash layer

const GarbageVisualizerScreen: React.FC = () => {
  const { user } = useAuth();
  const { wasteEntries, fetchUserWasteEntries, loading } = useWaste();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (user && !hasLoaded.current) {
      fetchUserWasteEntries(user.id);
      hasLoaded.current = true;
    }
  }, [user, fetchUserWasteEntries]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const { totalWeight, weeklyTotals } = useMemo(() => {
    const monthEntries = wasteEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const totals = Array.from({ length: 6 }, (_, idx) => ({
      label: `Week ${idx + 1}`,
      weight: 0,
    }));

    monthEntries.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      const weekIndex = Math.min(5, Math.floor((entryDate.getDate() - 1) / 7));
      totals[weekIndex].weight += entry.quantity;
    });

    const weight = monthEntries.reduce((sum, entry) => sum + entry.quantity, 0);

    return { totalWeight: weight, weeklyTotals: totals };
  }, [wasteEntries, currentMonth, currentYear]);

  const layerCount = totalWeight > 0 ? Math.min(6, Math.ceil(totalWeight / layerWeightStep)) : 1;
  const maxWeekWeight = Math.max(...weeklyTotals.map((week) => week.weight), 1);
  const monthLabel = now.toLocaleString('default', { month: 'long' });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.heroCard}>
        <View style={styles.heroIconWrapper}>
          <MaterialCommunityIcons name="raccoon" size={54} color="#f0fdf4" />
        </View>
        <View style={styles.heroTextWrapper}>
          <Text style={styles.heroTitle}>Trash Patrol</Text>
          <Text style={styles.heroSubtitle}>
            Track how much garbage piles up each week. Your mischievous raccoon mascot resets the heap
            every {monthLabel}.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Current Month Load</Text>
          <Text style={styles.summaryValue}>{totalWeight.toFixed(1)} kg</Text>
        </View>
        <View style={styles.summaryResetBlock}>
          <MaterialCommunityIcons name="refresh-auto" size={24} color="#10b981" />
          <Text style={styles.summaryResetText}>Resets {monthLabel} 1</Text>
        </View>
      </View>

      <View style={styles.pileCard}>
        <View style={styles.pileHeader}>
          <Text style={styles.pileTitle}>Garbage Pile</Text>
          <Text style={styles.pileHint}>Grows with every kg logged this month</Text>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Fetching your trail...</Text>
          </View>
        ) : (
          <View style={styles.pileGraphic}>
            <View style={styles.pileShadow} />
            {Array.from({ length: layerCount }).map((_, idx) => {
              const layerIndex = layerCount - idx - 1;
              const layerWidth = 120 + layerIndex * 20;
              const layerHeight = 26 + layerIndex * 10;
              const iconCount = 3 + (layerIndex % 3);
              const iconSet = GARBAGE_ICON_SET.slice(0, iconCount);

              return (
                <View
                  key={`layer-${layerIndex}`}
                  style={[
                    styles.pileLayer,
                    {
                      width: layerWidth,
                      height: layerHeight,
                      backgroundColor: GARBAGE_LAYER_COLORS[layerIndex % GARBAGE_LAYER_COLORS.length],
                      bottom: idx * 18,
                    },
                  ]}
                >
                  <View style={styles.layerIconRow}>
                    {iconSet.map((iconName, iconIdx) => (
                      <MaterialCommunityIcons
                        key={`${iconName}-${iconIdx}`}
                        name={iconName}
                        size={20}
                        color="#f8fafc"
                        style={styles.layerIcon}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.pileFooter}>
          Pile scale: every {layerWeightStep} kg logged stacks a fresh layer of trash.
        </Text>
      </View>

      <View style={styles.weekSection}>
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>Weekly Breakdown</Text>
          <Text style={styles.weekSubtitle}>Compare how much trash you captured each week.</Text>
        </View>
        {weeklyTotals.map((week) => (
          <View key={week.label} style={styles.weekCard}>
            <View style={styles.weekCardHeader}>
              <Text style={styles.weekLabel}>{week.label}</Text>
              <Text style={styles.weekValue}>{week.weight.toFixed(1)} kg</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, Math.max(6, (week.weight / maxWeekWeight) * 100))}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.weekIcons}>
              <MaterialCommunityIcons name="trash-can" size={18} color="#475569" />
              <MaterialCommunityIcons name="recycle" size={18} color="#22c55e" />
              <MaterialCommunityIcons name="bottle-soda" size={18} color="#0f172a" />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconWrapper: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(248,250,252,0.9)',
    fontSize: 15,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },
  summaryResetBlock: {
    alignItems: 'flex-end',
  },
  summaryResetText: {
    marginTop: 6,
    color: '#0f172a',
    fontWeight: '600',
  },
  pileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  pileHeader: {
    marginBottom: 16,
  },
  pileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  pileHint: {
    color: '#475569',
    marginTop: 4,
  },
  pileGraphic: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 220,
    position: 'relative',
  },
  pileShadow: {
    width: 200,
    height: 26,
    backgroundColor: 'rgba(15,23,42,0.1)',
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
  },
  pileLayer: {
    borderRadius: 30,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layerIcon: {
    marginHorizontal: 4,
  },
  pileFooter: {
    textAlign: 'center',
    color: '#475569',
    marginTop: 16,
    fontStyle: 'italic',
  },
  loadingState: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#475569',
  },
  weekSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 30,
  },
  weekHeader: {
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  weekSubtitle: {
    color: '#475569',
    marginTop: 4,
  },
  weekCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekLabel: {
    fontWeight: '600',
    color: '#0f172a',
  },
  weekValue: {
    fontWeight: '700',
    color: '#10b981',
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#10b981',
  },
  weekIcons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
});

export default GarbageVisualizerScreen;
