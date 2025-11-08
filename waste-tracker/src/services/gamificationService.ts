import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge, Streak, Challenge, Achievement } from '../types/gamification';

class GamificationService {
  private readonly BADGES_KEY = '@badges';
  private readonly STREAK_KEY = '@streak';
  private readonly CHALLENGES_KEY = '@challenges';
  private readonly ACHIEVEMENTS_KEY = '@achievements';

  // Badge definitions
  private readonly ALL_BADGES: Omit<Badge, 'earned' | 'earnedDate'>[] = [
    {
      id: 'first_entry',
      name: 'Getting Started',
      description: 'Log your first waste entry',
      icon: 'leaf-outline',
      requirement: 1,
      type: 'entries',
      color: '#10b981',
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Log 10 waste entries',
      icon: 'shield-checkmark',
      requirement: 10,
      type: 'entries',
      color: '#3b82f6',
    },
    {
      id: 'waste_master',
      name: 'Waste Master',
      description: 'Log 50 waste entries',
      icon: 'trophy',
      requirement: 50,
      type: 'entries',
      color: '#f59e0b',
    },
    {
      id: 'point_collector',
      name: 'Point Collector',
      description: 'Earn 500 points',
      icon: 'star',
      requirement: 500,
      type: 'points',
      color: '#f59e0b',
    },
    {
      id: 'point_master',
      name: 'Point Master',
      description: 'Earn 2000 points',
      icon: 'star',
      requirement: 2000,
      type: 'points',
      color: '#ef4444',
    },
    {
      id: 'streak_starter',
      name: 'Streak Starter',
      description: 'Maintain a 3-day streak',
      icon: 'flame',
      requirement: 3,
      type: 'streak',
      color: '#f97316',
    },
    {
      id: 'streak_legend',
      name: 'Streak Legend',
      description: 'Maintain a 7-day streak',
      icon: 'flame',
      requirement: 7,
      type: 'streak',
      color: '#dc2626',
    },
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Be one of the first users',
      icon: 'rocket',
      requirement: 1,
      type: 'special',
      color: '#8b5cf6',
    },
  ];

  // Initialize badges for user
  async initializeBadges(): Promise<void> {
    const existing = await AsyncStorage.getItem(this.BADGES_KEY);
    if (!existing) {
      const badges: Badge[] = this.ALL_BADGES.map(b => ({
        ...b,
        earned: false,
      }));
      await AsyncStorage.setItem(this.BADGES_KEY, JSON.stringify(badges));
    }
  }

  // Get all badges
  async getBadges(): Promise<Badge[]> {
    const data = await AsyncStorage.getItem(this.BADGES_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Check and award badges
  async checkBadges(entries: number, points: number, streak: number): Promise<Badge[]> {
    const badges = await this.getBadges();
    const newlyEarned: Badge[] = [];

    badges.forEach(badge => {
      if (!badge.earned) {
        let shouldEarn = false;

        switch (badge.type) {
          case 'entries':
            shouldEarn = entries >= badge.requirement;
            break;
          case 'points':
            shouldEarn = points >= badge.requirement;
            break;
          case 'streak':
            shouldEarn = streak >= badge.requirement;
            break;
        }

        if (shouldEarn) {
          badge.earned = true;
          badge.earnedDate = new Date();
          newlyEarned.push(badge);
        }
      }
    });

    if (newlyEarned.length > 0) {
      await AsyncStorage.setItem(this.BADGES_KEY, JSON.stringify(badges));
    }

    return newlyEarned;
  }

  // Streak management
  async getStreak(): Promise<Streak> {
    const data = await AsyncStorage.getItem(this.STREAK_KEY);
    if (data) {
      const streak = JSON.parse(data);
      return {
        ...streak,
        lastLogDate: streak.lastLogDate ? new Date(streak.lastLogDate) : null,
      };
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      streakActive: false,
    };
  }

  async updateStreak(): Promise<{ streak: Streak; streakIncreased: boolean }> {
    const streak = await this.getStreak();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let streakIncreased = false;

    if (!streak.lastLogDate) {
      // First entry ever
      streak.currentStreak = 1;
      streak.longestStreak = 1;
      streak.streakActive = true;
      streakIncreased = true;
    } else {
      const lastLog = new Date(streak.lastLogDate);
      const lastLogDay = new Date(lastLog.getFullYear(), lastLog.getMonth(), lastLog.getDate());
      const diffTime = today.getTime() - lastLogDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, don't increment
        streak.streakActive = true;
      } else if (diffDays === 1) {
        // Next day, increment streak
        streak.currentStreak += 1;
        streak.streakActive = true;
        streakIncreased = true;
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      } else {
        // Streak broken
        streak.currentStreak = 1;
        streak.streakActive = true;
        streakIncreased = false;
      }
    }

    streak.lastLogDate = now;
    await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify(streak));

    return { streak, streakIncreased };
  }

  // Generate daily challenges
  async generateDailyChallenges(): Promise<void> {
    const existing = await this.getChallenges();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if we already have today's challenges
    const hasToday = existing.some(c => {
      const start = new Date(c.startDate);
      return start.getTime() === today.getTime() && c.type === 'daily';
    });

    if (!hasToday) {
      const dailyChallenges: Challenge[] = [
        {
          id: `daily_${now.getTime()}_1`,
          name: 'Daily Logger',
          description: 'Log 3 waste entries today',
          type: 'daily',
          goal: 3,
          progress: 0,
          reward: 50,
          icon: 'checkmark-circle',
          color: '#10b981',
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        },
        {
          id: `daily_${now.getTime()}_2`,
          name: 'Point Hunter',
          description: 'Earn 100 points today',
          type: 'daily',
          goal: 100,
          progress: 0,
          reward: 75,
          icon: 'star',
          color: '#f59e0b',
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        },
      ];

      const filtered = existing.filter(c => c.type !== 'daily' || !this.isChallengeExpired(c));
      const updated = [...filtered, ...dailyChallenges];
      await AsyncStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(updated));
    }
  }

  private isChallengeExpired(challenge: Challenge): boolean {
    return new Date(challenge.endDate).getTime() < new Date().getTime();
  }

  async getChallenges(): Promise<Challenge[]> {
    const data = await AsyncStorage.getItem(this.CHALLENGES_KEY);
    if (!data) return [];
    
    const challenges: Challenge[] = JSON.parse(data);
    return challenges
      .filter(c => !this.isChallengeExpired(c))
      .map(c => ({
        ...c,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
      }));
  }

  async updateChallengeProgress(entries: number, points: number): Promise<Challenge[]> {
    const challenges = await this.getChallenges();
    const completed: Challenge[] = [];

    challenges.forEach(challenge => {
      if (!challenge.completed) {
        if (challenge.name.includes('entries') || challenge.name.includes('Logger')) {
          challenge.progress = entries;
        } else if (challenge.name.includes('points') || challenge.name.includes('Point')) {
          challenge.progress = points;
        }

        if (challenge.progress >= challenge.goal) {
          challenge.completed = true;
          completed.push(challenge);
        }
      }
    });

    await AsyncStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
    return completed;
  }

  // Achievements
  async addAchievement(achievement: Omit<Achievement, 'id' | 'timestamp'>): Promise<void> {
    const achievements = await this.getAchievements();
    const newAchievement: Achievement = {
      ...achievement,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    achievements.unshift(newAchievement);
    await AsyncStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  }

  async getAchievements(): Promise<Achievement[]> {
    const data = await AsyncStorage.getItem(this.ACHIEVEMENTS_KEY);
    if (!data) return [];
    const achievements: Achievement[] = JSON.parse(data);
    return achievements.map(a => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));
  }
}

export const gamificationService = new GamificationService();
