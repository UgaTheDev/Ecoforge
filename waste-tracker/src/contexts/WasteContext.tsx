import React, { createContext, useState, useContext, ReactNode } from 'react';
import { WasteEntry, LeaderboardEntry } from '../types';
import { wasteService } from '../services/wasteService';

interface WasteContextType {
  wasteEntries: WasteEntry[];
  leaderboard: LeaderboardEntry[];
  addWasteEntry: (entry: Omit<WasteEntry, 'id' | 'timestamp'>) => Promise<void>;
  fetchUserWasteEntries: (userId: string) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  loading: boolean;
}

const WasteContext = createContext<WasteContextType | undefined>(undefined);

export const WasteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const addWasteEntry = async (entry: Omit<WasteEntry, 'id' | 'timestamp'>) => {
    setLoading(true);
    try {
      const newEntry = await wasteService.addWasteEntry(entry);
      setWasteEntries(prev => [newEntry, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWasteEntries = async (userId: string) => {
    setLoading(true);
    try {
      const entries = await wasteService.getUserWasteEntries(userId);
      setWasteEntries(entries);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await wasteService.getLeaderboard();
      setLeaderboard(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WasteContext.Provider value={{
      wasteEntries,
      leaderboard,
      addWasteEntry,
      fetchUserWasteEntries,
      fetchLeaderboard,
      loading
    }}>
      {children}
    </WasteContext.Provider>
  );
};

export const useWaste = () => {
  const context = useContext(WasteContext);
  if (context === undefined) {
    throw new Error('useWaste must be used within a WasteProvider');
  }
  return context;
};
