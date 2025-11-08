import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useWaste } from '../contexts/WasteContext';
import { useGamification } from '../contexts/GamificationContext';
import WasteCard from '../components/WasteCard';
import StatsCard from '../components/StatsCard';
import StreakDisplay from '../components/StreakDisplay';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { wasteEntries, fetchUserWasteEntries, loading } = useWaste();
  const { streak, badges } = useGamification();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (user) {
      await fetchUserWasteEntries(user.id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalPoints = wasteEntries.reduce((sum, entry) => sum + entry.points, 0);
  const totalWaste = wasteEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const earnedBadges = badges.filter(b => b.earned).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username}!</Text>
        </View>
        <TouchableOpacity 
          style={styles.rewardsButton}
          onPress={() => navigation.navigate('Rewards')}
        >
          <Ionicons name="gift" size={24} color="#10b981" />
          {earnedBadges > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{earnedBadges}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={wasteEntries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.statsContainer}>
              <StatsCard
                icon="star"
                label="Total Points"
                value={totalPoints}
                gradient={['#f59e0b', '#d97706']}
              />
              <StatsCard
                icon="trash"
                label="Waste Logged"
                value={`${totalWaste.toFixed(1)} kg`}
                gradient={['#10b981', '#059669']}
              />
            </View>

            {/* Streak Display */}
            <StreakDisplay 
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {wasteEntries.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="camera-outline" size={64} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>No waste logged yet</Text>
                <Text style={styles.emptyText}>
                  Start your streak by taking a photo! 🔥
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('Camera')}
                >
                  <Text style={styles.emptyButtonText}>Log Waste</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <WasteCard
            entry={item}
            onPress={() => navigation.navigate('WasteDetail', { entry: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  rewardsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
