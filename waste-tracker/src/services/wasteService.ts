import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  WasteEntry,
  LeaderboardEntry,
  WasteAnalysis,
  WasteType,
} from "../types";

class WasteService {
  private readonly WASTE_ENTRIES_KEY = "@waste_entries";
  private readonly LEADERBOARD_KEY = "@leaderboard";

  /**
   * Simulates waste analysis based on an image URI.
   */
  async analyzeWaste(imageUri: string): Promise<WasteAnalysis> {
    // Simulates an API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const wasteTypes = Object.values(WasteType);
    const randomType =
      wasteTypes[Math.floor(Math.random() * wasteTypes.length)];

    return {
      wasteType: randomType,
      confidence: 0.85 + Math.random() * 0.15,
      quantity: Math.floor(Math.random() * 10) + 1,
      estimatedWeight: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
    };
  }

  /**
   * Calculates points based on waste type and quantity.
   */
  calculatePoints(wasteType: WasteType, quantity: number): number {
    const basePoints: Record<WasteType, number> = {
      [WasteType.FOOD]: 10,
      [WasteType.PLASTIC]: 15,
      [WasteType.PAPER]: 8,
      [WasteType.GLASS]: 12,
      [WasteType.METAL]: 20,
      [WasteType.ELECTRONIC]: 25,
      [WasteType.ORGANIC]: 10,
      [WasteType.TEXTILE]: 15,
      [WasteType.HAZARDOUS]: 30,
      [WasteType.OTHER]: 5,
    };

    return Math.floor(basePoints[wasteType] * quantity);
  }

  /**
   * Adds a new waste entry and updates the leaderboard.
   * NOTE: The entry must now include 'imageUri' and 'username' which were missing in the context flow.
   */
  async addWasteEntry(
    entry: Omit<WasteEntry, "id" | "timestamp">
  ): Promise<WasteEntry> {
    const newEntry: WasteEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      // Fix: Ensure timestamp is a Date object on creation
      timestamp: new Date(),
    };

    const entries = await this.getAllWasteEntries();
    // Use unshift to put newest entries first
    entries.unshift(newEntry);

    await AsyncStorage.setItem(this.WASTE_ENTRIES_KEY, JSON.stringify(entries));
    await this.updateLeaderboard(
      newEntry.userId,
      newEntry.username,
      newEntry.points,
      newEntry.quantity
    );

    return newEntry;
  }

  /**
   * Retrieves all waste entries for a specific user.
   */
  async getUserWasteEntries(userId: string): Promise<WasteEntry[]> {
    const allEntries = await this.getAllWasteEntries();
    return allEntries.filter((entry) => entry.userId === userId);
  }

  /**
   * Retrieves all waste entries, converting timestamps from strings back to Date objects.
   */
  async getAllWasteEntries(): Promise<WasteEntry[]> {
    const data = await AsyncStorage.getItem(this.WASTE_ENTRIES_KEY);
    const rawEntries: WasteEntry[] = data ? JSON.parse(data) : [];

    // Ensure timestamps are correctly converted back from string (how AsyncStorage stores them) to Date objects.
    return rawEntries.map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  }

  /**
   * Retrieves and ranks the leaderboard data.
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const data = await AsyncStorage.getItem(this.LEADERBOARD_KEY);
    const leaderboard: LeaderboardEntry[] = data ? JSON.parse(data) : [];

    leaderboard.sort((a, b) => b.points - a.points);
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  /**
   * Internal method to update the leaderboard data.
   */
  private async updateLeaderboard(
    userId: string,
    username: string,
    pointsToAdd: number,
    wasteToAdd: number
  ): Promise<void> {
    // We must call getAllWasteEntries to ensure proper timestamp conversion, but for now
    // we use getLeaderboard which ensures current state is retrieved.
    const leaderboard = await this.getLeaderboard();
    const userIndex = leaderboard.findIndex(
      (entry) => entry.user.id === userId
    );

    if (userIndex >= 0) {
      // Update existing user
      leaderboard[userIndex].points += pointsToAdd;
      leaderboard[userIndex].totalWaste += wasteToAdd;
      leaderboard[userIndex].user.points += pointsToAdd;
      leaderboard[userIndex].user.totalWasteLogged += wasteToAdd;
    } else {
      // Add new user to leaderboard
      leaderboard.push({
        rank: 0, // Will be updated by getLeaderboard before saving
        points: pointsToAdd,
        totalWaste: wasteToAdd,
        user: {
          id: userId,
          username: username,
          email: `${username}@example.com`, // Mock email
          points: pointsToAdd,
          totalWasteLogged: wasteToAdd,
        },
      });
    }

    // Recalculate ranks before saving
    leaderboard.sort((a, b) => b.points - a.points);
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    await AsyncStorage.setItem(
      this.LEADERBOARD_KEY,
      JSON.stringify(rankedLeaderboard)
    );
  }

  /**
   * Initializes demo leaderboard data if none exists.
   */
  async initializeDemoData(): Promise<void> {
    const existingData = await AsyncStorage.getItem(this.LEADERBOARD_KEY);
    if (existingData) return;

    const demoData: LeaderboardEntry[] = [
      {
        rank: 1,
        user: {
          id: "1",
          username: "EcoWarrior",
          email: "eco@example.com",
          points: 1250,
          totalWasteLogged: 45,
        },
        points: 1250,
        totalWaste: 45,
      },
      {
        rank: 2,
        user: {
          id: "2",
          username: "GreenQueen",
          email: "green@example.com",
          points: 980,
          totalWasteLogged: 38,
        },
        points: 980,
        totalWaste: 38,
      },
      {
        rank: 3,
        user: {
          id: "3",
          username: "RecycleKing",
          email: "recycle@example.com",
          points: 875,
          totalWasteLogged: 32,
        },
        points: 875,
        totalWaste: 32,
      },
    ];

    await AsyncStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(demoData));
  }
}

export const wasteService = new WasteService();
