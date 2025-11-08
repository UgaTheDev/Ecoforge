import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      loadData();
    }
    
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
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
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>{user?.username}! 👋</Text>
            </View>
            <TouchableOpacity 
              style={styles.rewardsButton}
              onPress={() => navigation.navigate('Rewards')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                style={styles.rewardsButtonGradient}
              >
                <Ionicons name="gift" size={24} color="#fff" />
                {earnedBadges > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{earnedBadges}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <FlatList
        data={wasteEntries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.statsContainer}>
              <StatsCard
                icon="star"
                label="Total Points"
                value={totalPoints}
                gradient={['#fbbf24', '#f59e0b']}
                delay={100}
              />
              <StatsCard
                icon="trash"
                label="Waste Logged"
                value={`${totalWaste.toFixed(1)} kg`}
                gradient={['#34d399', '#10b981']}
                delay={200}
              />
            </View>

            <StreakDisplay 
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
            />

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="time-outline" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Recent Activity</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            {wasteEntries.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={['#f0fdf4', '#dcfce7']}
                    style={styles.emptyIconGradient}
                  >
                    <Ionicons name="camera" size={48} color="#10b981" />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>Start Your Journey</Text>
                <Text style={styles.emptyText}>
                  Log your first waste entry and start building your streak! 🔥
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('Camera')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.emptyButtonGradient}
                  >
                    <Ionicons name="add-circle" size={24} color="#fff" />
                    <Text style={styles.emptyButtonText}>Log Waste</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <WasteCard
            entry={item}
            index={index}
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
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '500',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  rewardsButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  rewardsButtonGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '700',
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
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default HomeScreen;
