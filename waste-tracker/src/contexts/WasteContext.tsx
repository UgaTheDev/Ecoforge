import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useEffect, // Added useEffect for initial data load
} from "react";
import { WasteEntry, LeaderboardEntry, WasteType } from "../types"; // <-- Ensure WasteType is imported
import { wasteService } from "../services/wasteService";
import { useAuth } from "./AuthContext"; // Import useAuth to get user info

interface NewWasteInput {
  wasteType: WasteType;
  quantity: number;
  estimatedWeight: number;
  imageUri: string; // Must be included to satisfy WasteEntry type
}

interface WasteContextType {
  wasteEntries: WasteEntry[];
  leaderboard: LeaderboardEntry[];
  // Updated signature to take the required input fields
  addWasteEntry: (entry: NewWasteInput) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  // FIX: Re-adding fetchUserWasteEntries to the public interface
  fetchUserWasteEntries: (userId: string) => Promise<void>;
  loading: boolean;
}

const WasteContext = createContext<WasteContextType | undefined>(undefined);

export const WasteProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth(); // Get user and loading state
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wasteService.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch user specific waste entries
  const fetchUserWasteEntries = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const entries = await wasteService.getUserWasteEntries(userId);
      setWasteEntries(entries);
    } catch (error) {
      console.error("Error fetching waste entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Updated addWasteEntry to inject user ID, username, and calculate points
  const addWasteEntry = useCallback(
    async (entry: NewWasteInput) => {
      if (!user?.id || !user?.username) {
        console.error(
          "Cannot add waste entry: User ID or Username is missing."
        );
        return;
      }

      setLoading(true);
      try {
        const points = wasteService.calculatePoints(
          entry.wasteType,
          entry.quantity
        );

        // Prepare entry for service, injecting mandatory fields
        const entryForService: Omit<WasteEntry, "id" | "timestamp"> = {
          ...entry,
          userId: user.id,
          username: user.username, // Required field for WasteEntry
          points,
        };

        const newEntry = await wasteService.addWasteEntry(entryForService);
        setWasteEntries((prev) => [newEntry, ...prev]);

        // After logging waste, refresh the leaderboard data
        await fetchLeaderboard();
      } catch (error) {
        console.error("Error adding waste entry:", error);
      } finally {
        setLoading(false);
      }
    },
    [user, fetchLeaderboard] // Dependency on user (for ID/username) and fetchLeaderboard
  );

  // --- CRUCIAL: Load user data when authentication status changes ---
  useEffect(() => {
    // Fix: Use the initializeDemoData method, which is now properly defined on the service
    wasteService.initializeDemoData();

    // 2. Fetch data if the user is logged in AND auth is done loading
    if (user?.id && !authLoading) {
      fetchUserWasteEntries(user.id);
      fetchLeaderboard();
    } else if (!user && !authLoading) {
      // Clear data if logged out
      setWasteEntries([]);
      setLeaderboard([]);
    }
    // Re-run whenever user object or authLoading status changes
  }, [user, authLoading, fetchUserWasteEntries, fetchLeaderboard]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      wasteEntries,
      leaderboard,
      addWasteEntry,
      fetchLeaderboard,
      // FIX: Include the function in the exported value
      fetchUserWasteEntries,
      loading: loading || authLoading, // Combine local loading with auth loading
    }),
    [
      wasteEntries,
      leaderboard,
      loading,
      authLoading,
      addWasteEntry,
      fetchLeaderboard,
      fetchUserWasteEntries, // FIX: Dependency added
    ]
  );

  return (
    <WasteContext.Provider value={contextValue}>
      {children}
    </WasteContext.Provider>
  );
};

export const useWaste = () => {
  const context = useContext(WasteContext);
  if (context === undefined) {
    throw new Error("useWaste must be used within a WasteProvider");
  }
  return context;
};
