export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'entries' | 'points' | 'streak' | 'special';
  earned: boolean;
  earnedDate?: Date;
  color: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: Date | null;
  streakActive: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  goal: number;
  progress: number;
  reward: number; // points
  icon: string;
  color: string;
  startDate: Date;
  endDate: Date;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  timestamp: Date;
  icon: string;
  color: string;
}
