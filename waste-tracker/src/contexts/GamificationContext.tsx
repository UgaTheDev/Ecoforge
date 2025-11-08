import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Badge, Streak, Challenge, Achievement } from '../types/gamification';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from './AuthContext';

interface GamificationContextType {
  badges: Badge[];
  streak: Streak;
  challenges: Challenge[];
  achievements: Achievement[];
  refreshGamification: () => Promise<void>;
  checkProgress: (entries: number, points: number) => Promise<{
    newBadges: Badge[];
    completedChallenges: Challenge[];
    streakIncreased: boolean;
  }>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState<Streak>({
    currentStreak: 0,
    longestStreak: 0,
    lastLogDate: null,
    streakActive: false,
  });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeGamification();
    }
  }, [user]);

  const initializeGamification = async () => {
    await gamificationService.initializeBadges();
    await gamificationService.generateDailyChallenges();
    await refreshGamification();
  };

  const refreshGamification = async () => {
    const [badgesData, streakData, challengesData, achievementsData] = await Promise.all([
      gamificationService.getBadges(),
      gamificationService.getStreak(),
      gamificationService.getChallenges(),
      gamificationService.getAchievements(),
    ]);

    setBadges(badgesData);
    setStreak(streakData);
    setChallenges(challengesData);
    setAchievements(achievementsData);
  };

  const checkProgress = async (entries: number, points: number) => {
    // Update streak
    const { streak: newStreak, streakIncreased } = await gamificationService.updateStreak();
    setStreak(newStreak);

    // Check badges
    const newBadges = await gamificationService.checkBadges(entries, points, newStreak.currentStreak);
    if (newBadges.length > 0) {
      setBadges(await gamificationService.getBadges());
    }

    // Update challenges
    const completedChallenges = await gamificationService.updateChallengeProgress(entries, points);
    if (completedChallenges.length > 0) {
      setChallenges(await gamificationService.getChallenges());
    }

    return { newBadges, completedChallenges, streakIncreased };
  };

  return (
    <GamificationContext.Provider
      value={{
        badges,
        streak,
        challenges,
        achievements,
        refreshGamification,
        checkProgress,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
