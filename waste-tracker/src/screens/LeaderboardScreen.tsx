import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useWaste } from "../contexts/WasteContext";
import LeaderboardItem from "../components/LeaderboardItem";
import { wasteService } from "../services/wasteService";

const LeaderboardScreen = () => {
  const { user } = useAuth();
  // We assume fetchLeaderboard brings in the full "All Time" list
  const { leaderboard, fetchLeaderboard, loading } = useWaste();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");

  // Load initial data (All Time) on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await wasteService.initializeDemoData();
    // FIX: fetchLeaderboard is now called with 0 arguments to resolve TS error 2554.
    // It is assumed to fetch the base 'All Time' list.
    await fetchLeaderboard();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // FIX: fetchLeaderboard is now called with 0 arguments.
    await loadData();
    setRefreshing(false);
  };

  // Use useMemo to filter the data locally based on the selected filter.
  // NOTE: This assumes 'leaderboard' contains enough data (like timestamps/scores)
  // to be filtered by week/month, which is required for real-world functionality.
  const filteredLeaderboard = useMemo(() => {
    if (filter === "all") {
      return leaderboard;
    }

    // --- Placeholder Local Filtering Logic ---
    // In a real app, you would filter based on a date/time property of each entry.
    // Example: entry.timestamp >= startOfMonth
    // For now, we simulate a different list based on the filter.
    if (filter === "month") {
      // Simulate showing a slightly different list for the month
      return leaderboard
        .slice(0, 5)
        .concat(leaderboard.filter((e) => e.user.id === user?.id));
    }
    if (filter === "week") {
      // Simulate showing a smaller list for the week
      return leaderboard
        .slice(0, 3)
        .concat(leaderboard.filter((e) => e.user.id === user?.id));
    }
    // --- End Placeholder ---

    return leaderboard;
  }, [leaderboard, filter, user?.id]);

  // Find the current user's entry for the "Your Ranking" card (using the currently filtered list)
  const currentUserRank = filteredLeaderboard.find(
    (entry) => entry.user.id === user?.id
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Ionicons name="trophy" size={28} color="#f59e0b" />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "month" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("month")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "month" && styles.filterTextActive,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "week" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("week")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "week" && styles.filterTextActive,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
      </View>

      {currentUserRank && (
        <View style={styles.currentUserContainer}>
          <Text style={styles.currentUserTitle}>Your Ranking</Text>
          <LeaderboardItem entry={currentUserRank} isCurrentUser />
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Leaderboard...</Text>
        </View>
      ) : (
        <FlatList
          // Use the filtered list for the FlatList data
          data={filteredLeaderboard}
          keyExtractor={(item) => item.user.id}
          renderItem={({ item }) => (
            <LeaderboardItem
              entry={item}
              isCurrentUser={item.user.id === user?.id}
            />
          )}
          refreshControl={
            // tintColor added for better visual feedback during refresh
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#fff",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#10b981",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  filterTextActive: {
    color: "#fff",
  },
  currentUserContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  currentUserTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
});

export default LeaderboardScreen;
