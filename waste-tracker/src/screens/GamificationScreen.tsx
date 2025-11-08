import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGamification } from '../contexts/GamificationContext';
import StreakDisplay from '../components/StreakDisplay';
import BadgeCard from '../components/BadgeCard';
import ChallengeCard from '../components/ChallengeCard';

const GamificationScreen = () => {
  const { badges, streak, challenges } = useGamification();

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);
  const activeChallenges = challenges.filter(c => !c.completed);
  const completedChallenges = challenges.filter(c => c.completed);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <Ionicons name="gift" size={28} color="#10b981" />
      </View>

      {/* Streak Section */}
      <StreakDisplay 
        currentStreak={streak.currentStreak} 
        longestStreak={streak.longestStreak} 
      />

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Active Challenges</Text>
          </View>
          {activeChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </View>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>Completed Today</Text>
          </View>
          {completedChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </View>
      )}

      {/* Badges Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon" size={24} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>
            Badges ({earnedBadges.length}/{badges.length})
          </Text>
        </View>

        {earnedBadges.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Earned</Text>
            <FlatList
              horizontal
              data={earnedBadges}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <BadgeCard badge={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesList}
            />
          </>
        )}

        {lockedBadges.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Locked</Text>
            <FlatList
              horizontal
              data={lockedBadges}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <BadgeCard badge={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesList}
            />
          </>
        )}
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={32} color="#f59e0b" />
          <Text style={styles.statValue}>{earnedBadges.length}</Text>
          <Text style={styles.statLabel}>Badges Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color="#f97316" />
          <Text style={styles.statValue}>{streak.longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={32} color="#10b981" />
          <Text style={styles.statValue}>{completedChallenges.length}</Text>
          <Text style={styles.statLabel}>Challenges Done</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  badgesList: {
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default GamificationScreen;
