import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

// Define the shape of the dynamic stats the screen needs
type ProfileStats = {
  points: number;
  totalWasteLogged: number;
  rank: number;
};

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  // State to hold dynamic profile data (points, rank, etc.)
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    points: 0,
    totalWasteLogged: 0,
    rank: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Simulate fetching profile stats when the user object is available
  useEffect(() => {
    if (user) {
      setLoadingStats(true);

      // --- SIMULATED ASYNCHRONOUS DATA FETCH ---
      // In a real application, this would be an API call to a protected endpoint
      // using the user's token (e.g., api.fetchUserStats(user.id)).
      const mockFetch = setTimeout(() => {
        // Mock the data returned from the server
        setProfileStats({
          points: 1540,
          totalWasteLogged: 35, // in kg
          rank: 124,
        });
        setLoadingStats(false);
      }, 700); // 700ms delay to simulate network latency

      return () => clearTimeout(mockFetch);
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const stats = [
    // Now use the state object for dynamic values
    {
      label: "Total Points",
      value: loadingStats ? "--" : profileStats.points,
      icon: "star",
      color: "#f59e0b",
    },
    {
      label: "Waste Logged",
      value: loadingStats ? "--" : `${profileStats.totalWasteLogged} kg`,
      icon: "trash",
      color: "#10b981",
    },
    {
      label: "Global Rank",
      value: loadingStats ? "--" : `#${profileStats.rank}`,
      icon: "trophy",
      color: "#3b82f6",
    },
  ];

  const menuItems = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      action: () => Alert.alert("WIP", "Edit Profile coming soon!"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      action: () => Alert.alert("WIP", "Notifications coming soon!"),
    },
    {
      icon: "shield-checkmark-outline",
      label: "Privacy",
      action: () => Alert.alert("WIP", "Privacy settings coming soon!"),
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      action: () => Alert.alert("WIP", "Help is on the way!"),
    },
    {
      icon: "information-circle-outline",
      label: "About",
      action: () => Alert.alert("WIP", "About this app coming soon!"),
    },
  ];

  // Simple loading indicator for the stats section
  const StatsPlaceholder = () => (
    <View style={styles.statsContainer}>
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <View key={index} style={[styles.statCard, { opacity: 0.5 }]}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#e2e8f0" }]}
            />
            <Text style={styles.statValue}>...</Text>
            <Text style={styles.statLabel}>Loading...</Text>
          </View>
        ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#10b981", "#059669"]} style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </LinearGradient>

      {loadingStats ? (
        <StatsPlaceholder />
      ) : (
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color },
                ]}
              >
                <Ionicons name={stat.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.action}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color="#64748b" />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#10b981",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  email: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#1e293b",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  version: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});

export default ProfileScreen;
