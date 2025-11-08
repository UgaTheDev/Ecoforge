import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useWaste } from "../contexts/WasteContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Garbage images
const garbageImages = {
  bag: require("../../Garbage/Bag.png"),
  bottle: require("../../Garbage/Bottle.png"),
  box: require("../../Garbage/Box.png"),
  brownBottle: require("../../Garbage/Brown glass bottle.png"),
  cup: require("../../Garbage/Cup.png"),
  detergent: require("../../Garbage/Detergent.png"),
  glassBottle: require("../../Garbage/Glass Bottle.png"),
  glassJar: require("../../Garbage/Glass jar.png"),
  jug: require("../../Garbage/Jug.png"),
  mug: require("../../Garbage/mug.png"),
  newspaper: require("../../Garbage/Newspaper.png"),
  pizzaBox: require("../../Garbage/Pizza box.png"),
  sodaCan: require("../../Garbage/Soda can.png"),
  sprayCan: require("../../Garbage/Spray can.png"),
  tinCan: require("../../Garbage/Tin can.png"),
  tunaCan: require("../../Garbage/Tuna Can.png"),
};

// Raccoon expressions based on garbage count
const raccoonExpressions = {
  crying: require("../../Raccoon/Rilo Crying.png"),
  curious: require("../../Raccoon/Rilo curious.png"),
  thumbsUp: require("../../Raccoon/Rilo Thumbs up.png"),
  cute: require("../../Raccoon/Rilo Cute.png"),
  excited: require("../../Raccoon/Rilo Excited.png"),
  trash: require("../../Raccoon/Rilo Trash.png"),
};

type GarbageItem = {
  id: string;
  image: any;
  x: number;
  velocity: number;
  rotationSpeed: number;
  size: number;
  animY: Animated.Value;
  animRotation: Animated.Value;
  isResting: boolean; // Flag if item has hit the ground
};

const POINTS_PER_ITEM = 10;
const GARBAGE_ZONE_HEIGHT = 400;
const GROUND_HEIGHT = 40; // Height of the green bar at the bottom
const GARBAGE_SIZE_MIN = 40;
const GARBAGE_SIZE_MAX = 70;
// Fall speed constants are doubled (2x speed)
const FALL_SPEED_MIN = 4;
const FALL_SPEED_MAX = 12;

const GarbageVisualizerScreen: React.FC = () => {
  const { user } = useAuth();
  const { wasteEntries, fetchUserWasteEntries, loading } = useWaste();

  // Item data is stored in a ref for direct mutation
  const itemRef = useRef<GarbageItem[]>([]);

  // Dummy state to force a re-render only when the total count of items changes.
  const [forceRender, setForceRender] = useState(0);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserWasteEntries(user.id);
    }
  }, [user, fetchUserWasteEntries]);

  // Calculate total points and garbageCount
  const totalPoints = wasteEntries.reduce(
    (sum, entry) => sum + entry.points,
    0
  );
  const garbageCount = Math.floor(totalPoints / POINTS_PER_ITEM);

  // Determine raccoon expression and message
  const getRaccoonExpression = () => {
    if (garbageCount === 0) return raccoonExpressions.crying;
    if (garbageCount <= 5) return raccoonExpressions.curious;
    if (garbageCount <= 15) return raccoonExpressions.thumbsUp;
    if (garbageCount <= 30) return raccoonExpressions.cute;
    if (garbageCount <= 50) return raccoonExpressions.excited;
    return raccoonExpressions.trash;
  };

  const getRaccoonMessage = () => {
    if (garbageCount === 0) return "No trash yet... I'm sad! 😢";
    if (garbageCount <= 5) return "Ooh, what's that? 🤔";
    if (garbageCount <= 15) return "Nice work! Keep going! 👍";
    if (garbageCount <= 30) return "You're doing great! 🌟";
    if (garbageCount <= 50) return "Wow! So much recycling! 🎉";
    return "TRASH MASTER! I'm in heaven! 🗑️👑";
  };

  // Effect to initialize, add, or remove items based on garbageCount
  useEffect(() => {
    const currentItems = itemRef.current;

    // Cleanup if count is zero
    if (garbageCount === 0) {
      currentItems.forEach((item) => {
        item.animY.stopAnimation();
        item.animRotation.stopAnimation();
      });
      itemRef.current = [];
    }

    // Add new items if garbageCount increased
    if (garbageCount > currentItems.length) {
      const garbageArray = Object.values(garbageImages);
      for (let i = currentItems.length; i < garbageCount; i++) {
        const randomImage =
          garbageArray[Math.floor(Math.random() * garbageArray.length)];
        const size =
          GARBAGE_SIZE_MIN +
          Math.random() * (GARBAGE_SIZE_MAX - GARBAGE_SIZE_MIN);

        currentItems.push({
          id: `garbage-${i}`,
          image: randomImage,
          x: Math.random() * (SCREEN_WIDTH - size - 40) + 20,
          velocity:
            FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
          rotationSpeed: (Math.random() - 0.5) * 2,
          size,
          animY: new Animated.Value(-(Math.random() * GARBAGE_ZONE_HEIGHT)),
          animRotation: new Animated.Value(Math.random() * 360),
          isResting: false, // Initialize as not resting
        });
      }
    }
    // Remove excess items if garbageCount decreased
    else if (garbageCount < currentItems.length) {
      const itemsToRemove = currentItems.length - garbageCount;
      currentItems.splice(currentItems.length - itemsToRemove, itemsToRemove);
    }

    // Force render update after count change or cleanup. This is crucial as it triggers the
    // second useEffect below which is responsible for starting the animation loop.
    setForceRender((c) => c + 1);
  }, [garbageCount]);

  // Animation Loop: Runs continuously via requestAnimationFrame
  useEffect(() => {
    const items = itemRef.current;

    // Helper to stop all animations and clear the frame reference
    const stopAnimation = () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      items.forEach((item) => {
        item.animY.stopAnimation();
        item.animRotation.stopAnimation();
      });
    };

    // Always stop the previous frame when dependencies change (garbageCount or forceRender changes)
    stopAnimation();

    const animate = () => {
      let activeAnimation = false; // Flag to see if any item is still falling

      for (const item of items) {
        // Skip items that have landed
        if (item.isResting) continue;

        activeAnimation = true; // At least one item is falling

        // Read current values (safe access to the internal value)
        const currentY = (item.animY as any)._value;
        const currentRotation = (item.animRotation as any)._value;

        const newY = currentY + item.velocity;
        const newRotation = currentRotation + item.rotationSpeed;

        // Mutate animated values (this automatically updates the Animated.View)
        item.animRotation.setValue(newRotation);

        // Calculate the Y position where the bottom of the item meets the top of the ground bar
        const REST_Y_POSITION = GARBAGE_ZONE_HEIGHT - GROUND_HEIGHT - item.size;

        if (newY >= REST_Y_POSITION) {
          // Item has hit the floor
          item.isResting = true;
          item.animY.setValue(REST_Y_POSITION); // Snap to the exact rest position
          item.animRotation.stopAnimation(); // Stop rotation
          item.velocity = 0; // Ensure no further movement
          item.rotationSpeed = 0; // Ensure no further rotation
        } else {
          // Item is still falling
          item.animY.setValue(newY);
        }
      }

      // Continue the loop only if there is at least one active falling item
      if (activeAnimation) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // If all items have landed, stop the requestAnimationFrame loop entirely
        stopAnimation();
      }
    };

    // Check if we need to start the animation loop (only if new items are falling)
    const hasFallingItems = items.some((item) => !item.isResting);

    if (hasFallingItems) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // The return function uses the stopAnimation helper
    return stopAnimation;
  }, [garbageCount, forceRender]); // <-- Added forceRender to ensure animation restarts after item creation

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your garbage stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Card */}
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.heroCard}>
        <View style={styles.heroIconWrapper}>
          <MaterialCommunityIcons name="delete" size={54} color="#f0fdf4" />
        </View>
        <View style={styles.heroTextWrapper}>
          <Text style={styles.heroTitle}>Raccoon Radar</Text>
          <Text style={styles.heroSubtitle}>
            Every 10 points spawns a piece of trash. Watch Rilo's reaction
            change!
          </Text>
        </View>
      </LinearGradient>

      {/* Points Summary */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Total Points</Text>
          <Text style={styles.summaryValue}>{totalPoints}</Text>
          <Text style={styles.summaryHint}>
            {garbageCount} pieces of garbage
          </Text>
        </View>
        <View style={styles.summaryIcon}>
          <MaterialCommunityIcons name="star" size={28} color="#f59e0b" />
        </View>
      </View>

      {/* Garbage Falling Zone */}
      <View style={styles.garbageCard}>
        <Text style={styles.garbageTitle}>Garbage Rain</Text>
        <Text style={styles.garbageHint}>
          {garbageCount === 0
            ? "Earn points to see garbage fall!"
            : `${garbageCount} items falling from the sky (or piled up!)`}
        </Text>

        <View style={styles.garbageZone}>
          {/* Sky gradient background */}
          <LinearGradient
            colors={["#bae6fd", "#e0f2fe", "#f0f9ff"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Falling and resting garbage items */}
          {/* Renders items directly from the ref, dependent on forceRender state */}
          {itemRef.current.map((item) => (
            <Animated.View
              key={item.id}
              style={[
                styles.garbageItem,
                {
                  left: item.x, // static prop
                  transform: [
                    { translateY: item.animY }, // animated prop
                    {
                      // animated prop
                      rotate: item.animRotation.interpolate({
                        inputRange: [0, 360],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={item.image}
                style={{ width: item.size, height: item.size }}
                resizeMode="contain"
              />
            </Animated.View>
          ))}

          {/* Ground indicator */}
          <View style={styles.ground}>
            <MaterialCommunityIcons name="grass" size={24} color="#22c55e" />
            <MaterialCommunityIcons name="grass" size={24} color="#22c55e" />
            <MaterialCommunityIcons name="grass" size={24} color="#22c55e" />
          </View>
        </View>
      </View>

      {/* Raccoon Reaction */}
      <View style={styles.raccoonCard}>
        <Text style={styles.raccoonTitle}>Rilo's Reaction</Text>

        <View style={styles.raccoonContainer}>
          <Image
            source={getRaccoonExpression()}
            style={styles.raccoonImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.raccoonMessageBox}>
          <Text style={styles.raccoonMessage}>{getRaccoonMessage()}</Text>
        </View>

        {/* Progress to next expression */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress to next reaction</Text>
            <Text style={styles.progressValue}>
              {garbageCount} / {Math.ceil((garbageCount + 1) / 5) * 5}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(garbageCount % 5) * 20}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Stats Breakdown */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Impact</Text>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="star" size={32} color="#f59e0b" />
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="trash-can"
              size={32}
              color="#ef4444"
            />
            <Text style={styles.statValue}>{garbageCount}</Text>
            <Text style={styles.statLabel}>Garbage Items</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="recycle" size={32} color="#10b981" />
            <Text style={styles.statValue}>{wasteEntries.length}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
        </View>

        <View style={styles.milestoneSection}>
          <Text style={styles.milestoneTitle}>Next Milestones</Text>
          {[
            { points: 50, reward: "Rilo Curious" },
            { points: 150, reward: "Rilo Thumbs Up" },
            { points: 300, reward: "Rilo Cute" },
            { points: 500, reward: "Rilo Excited" },
            { points: 1000, reward: "Rilo Trash Master" },
          ]
            .filter((m) => m.points > totalPoints)
            .slice(0, 3)
            .map((milestone) => (
              <View key={milestone.points} style={styles.milestoneItem}>
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={20}
                  color="#64748b"
                />
                <Text style={styles.milestoneText}>
                  {milestone.points} points - {milestone.reward}
                </Text>
              </View>
            ))}
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <MaterialCommunityIcons
          name="information"
          size={24}
          color="#0ea5e9"
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>
          <Text style={styles.infoBold}>Tip:</Text> Each piece of garbage
          represents 10 points you've earned. Keep logging waste to see Rilo's
          reactions change from crying to trash master!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
  heroCard: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  heroIconWrapper: {
    backgroundColor: "rgba(16,185,129,0.15)",
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "rgba(248,250,252,0.9)",
    fontSize: 15,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 4,
  },
  summaryHint: {
    color: "#475569",
    marginTop: 4,
  },
  summaryIcon: {
    backgroundColor: "rgba(245,158,11,0.15)",
    borderRadius: 16,
    padding: 14,
  },
  garbageCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  garbageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  garbageHint: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  garbageZone: {
    height: GARBAGE_ZONE_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  garbageItem: {
    position: "absolute",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_HEIGHT, // Using the constant here
    backgroundColor: "#22c55e20",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  raccoonCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  raccoonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  raccoonContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  raccoonImage: {
    width: 200,
    height: 200,
  },
  raccoonMessageBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  raccoonMessage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
  },
  progressSection: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 20,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  milestoneSection: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 20,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  milestoneText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#475569",
  },
  infoCard: {
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#0c4a6e",
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: "bold",
  },
});

export default GarbageVisualizerScreen;
