import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Matter from 'matter-js';
import { useWaste } from '../contexts/WasteContext';
import { useAuth } from '../contexts/AuthContext';

const Engine = Matter.Engine;
const Composite = Matter.Composite;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Query = Matter.Query;

const garbageImages = [
  require('../../Garbage/Bag.png'),
  require('../../Garbage/Bottle.png'),
  require('../../Garbage/Box.png'),
  require('../../Garbage/Brown glass bottle.png'),
  require('../../Garbage/Cup.png'),
  require('../../Garbage/Detergent.png'),
  require('../../Garbage/Glass Bottle.png'),
  require('../../Garbage/Glass jar.png'),
  require('../../Garbage/Jug.png'),
  require('../../Garbage/mug.png'),
  require('../../Garbage/Newspaper.png'),
  require('../../Garbage/Pizza box.png'),
  require('../../Garbage/Soda can.png'),
  require('../../Garbage/Spray can.png'),
  require('../../Garbage/Tin can.png'),
  require('../../Garbage/Tuna Can.png'),
] as const;

type GarbageImageSource = (typeof garbageImages)[number];

const WEEKS_TO_DISPLAY = 4;
const WEIGHT_STEP_KG = 0.5; // one image every 0.5 kg
const STARTING_IMAGES = 5;
const MAX_IMAGES = 80;

type PileBounds = {
  width: number;
  height: number;
};

type PieceConfig = {
  id: string;
  source: GarbageImageSource;
  width: number;
  height: number;
  initialX: number;
  initialY: number;
  initialAngle: number;
};

type PieceInstance = PieceConfig & { body: Matter.Body };

type RenderPiece = {
  id: string;
  source: GarbageImageSource;
  x: number;
  y: number;
  angle: number;
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const areSnapshotsEqual = (a: RenderPiece[], b: RenderPiece[]) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (
      left.id !== right.id ||
      Math.abs(left.x - right.x) > 0.5 ||
      Math.abs(left.y - right.y) > 0.5 ||
      Math.abs(left.angle - right.angle) > 0.01
    ) {
      return false;
    }
  }
  return true;
};

const GarbageVisualizerScreen: React.FC = () => {
  const { user } = useAuth();
  const { wasteEntries, fetchUserWasteEntries, loading } = useWaste();

  const engineRef = useRef<Matter.Engine | null>(null);
  const rafRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const pileBoundsRef = useRef<PileBounds | null>(null);
  const pilePiecesRef = useRef<Record<string, PieceInstance>>({});
  const boundaryBodiesRef = useRef<Matter.Body[]>([]);
  const dragConstraintRef = useRef<Matter.Constraint | null>(null);

  const [renderPieces, setRenderPieces] = useState<RenderPiece[]>([]);
  const renderPiecesRef = useRef<RenderPiece[]>([]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (engineRef.current) {
        Engine.clear(engineRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.0014 } });
    engineRef.current = engine;

    const tick = () => {
      Engine.update(engine, 16.666);
      if (isMountedRef.current) {
        syncPiecesToState();
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserWasteEntries(user.id);
    }
  }, [user, fetchUserWasteEntries]);

  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const currentWeekKey = currentWeekStart.toISOString();
  const daysUntilReset = getDaysUntilReset(now);

  const weeklyTotals = useMemo(() => {
    const template = Array.from({ length: WEEKS_TO_DISPLAY }, (_, index) => {
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - index * 7);
      return {
        key: start.toISOString(),
        start,
        rangeLabel: formatWeekRange(start),
        label: index === 0 ? 'This Week' : `Week of ${formatWeekRange(start)}`,
        weight: 0,
      };
    });

    const bucketMap = new Map(template.map((bucket) => [bucket.key, bucket]));
    const oldestTrackedWeek = template[template.length - 1].start;

    wasteEntries.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      if (entryDate < oldestTrackedWeek) {
        return;
      }
      const bucketKey = getWeekStart(entryDate).toISOString();
      const bucket = bucketMap.get(bucketKey);
      if (bucket) {
        bucket.weight += entry.quantity;
      }
    });

    return template;
  }, [wasteEntries, currentWeekStart]);

  const currentWeekWeight = weeklyTotals[0]?.weight ?? 0;
  const maxWeeklyWeight = Math.max(...weeklyTotals.map((week) => week.weight), 1);

  const computePieceCount = useCallback((weight: number) => {
    const steps = weight > 0 ? Math.ceil(weight / WEIGHT_STEP_KG) : 0;
    return clamp(STARTING_IMAGES + steps, STARTING_IMAGES, MAX_IMAGES);
  }, []);

  const createPieceConfigs = useCallback(
    (bounds: PileBounds, weight: number): PieceConfig[] => {
      const count = computePieceCount(weight);
      const configs: PieceConfig[] = [];
      const heightBase = Math.max(30, Math.min(55, bounds.height / 6));

      for (let i = 0; i < count; i += 1) {
        const size = heightBase * (0.8 + Math.random() * 0.6);
        const width = size * (0.85 + Math.random() * 0.35);
        const height = size;
        const initialX = clamp(Math.random() * bounds.width, width / 2, bounds.width - width / 2);
        const initialY = clamp(Math.random() * bounds.height * 0.3, height / 2, bounds.height * 0.4);

        configs.push({
          id: `${currentWeekKey}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          source: garbageImages[i % garbageImages.length],
          width,
          height,
          initialX,
          initialY,
          initialAngle: (Math.random() - 0.5) * 0.6,
        });
      }

      return configs;
    },
    [computePieceCount, currentWeekKey],
  );

  const syncPiecesToState = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    const snapshot = Object.values(pilePiecesRef.current).map((piece) => ({
      id: piece.id,
      source: piece.source,
      x: piece.body.position.x,
      y: piece.body.position.y,
      angle: piece.body.angle,
      width: piece.width,
      height: piece.height,
    }));

    if (areSnapshotsEqual(renderPiecesRef.current, snapshot)) {
      return;
    }

    renderPiecesRef.current = snapshot;
    setRenderPieces(snapshot);
  }, []);

  const rebuildWorld = useCallback(() => {
    const engine = engineRef.current;
    const bounds = pileBoundsRef.current;
    if (!engine || !bounds) {
      return;
    }

    boundaryBodiesRef.current.forEach((body) => Composite.remove(engine.world, body));
    boundaryBodiesRef.current = [];

    const floor = Bodies.rectangle(bounds.width / 2, bounds.height + 40, bounds.width, 80, {
      isStatic: true,
      restitution: 0.1,
      friction: 1,
    });
    const left = Bodies.rectangle(-40, bounds.height / 2, 80, bounds.height, { isStatic: true });
    const right = Bodies.rectangle(bounds.width + 40, bounds.height / 2, 80, bounds.height, { isStatic: true });
    boundaryBodiesRef.current = [floor, left, right];
    Composite.add(engine.world, boundaryBodiesRef.current);

    Object.values(pilePiecesRef.current).forEach((piece) => Composite.remove(engine.world, piece.body));
    pilePiecesRef.current = {};

    const configs = createPieceConfigs(bounds, currentWeekWeight);
    configs.forEach((config) => {
      const body = Bodies.rectangle(config.initialX, config.initialY, config.width, config.height, {
        friction: 0.9,
        frictionAir: 0.015,
        restitution: 0.15,
        density: 0.0014,
      });
      Matter.Body.setAngle(body, config.initialAngle);
      pilePiecesRef.current[config.id] = { ...config, body };
      Composite.add(engine.world, body);
    });

    syncPiecesToState();
  }, [createPieceConfigs, currentWeekWeight, syncPiecesToState]);

  useEffect(() => {
    rebuildWorld();
  }, [rebuildWorld]);

  const handlePileLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const currentBounds = pileBoundsRef.current;
    if (!currentBounds || currentBounds.width !== width || currentBounds.height !== height) {
      pileBoundsRef.current = { width, height };
      rebuildWorld();
    }
  };

  const attachDragConstraint = useCallback((x: number, y: number) => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    const bodies = Object.values(pilePiecesRef.current).map((piece) => piece.body);
    if (!bodies.length) {
      return;
    }
    const hits = Query.point(bodies, { x, y });
    if (!hits.length) {
      return;
    }
    const target = hits.sort((a, b) => b.position.y - a.position.y)[0];
    const constraint = Constraint.create({
      pointA: { x, y },
      bodyB: target,
      pointB: { x: 0, y: 0 },
      stiffness: 0.04,
      damping: 0.15,
    });
    dragConstraintRef.current = constraint;
    Composite.add(engine.world, constraint);
  }, []);

  const updateDragConstraint = useCallback((x: number, y: number) => {
    if (dragConstraintRef.current) {
      dragConstraintRef.current.pointA.x = x;
      dragConstraintRef.current.pointA.y = y;
    }
  }, []);

  const detachDragConstraint = useCallback(() => {
    const engine = engineRef.current;
    if (engine && dragConstraintRef.current) {
      Composite.remove(engine.world, dragConstraintRef.current);
      dragConstraintRef.current = null;
    }
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          attachDragConstraint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          updateDragConstraint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderRelease: () => detachDragConstraint(),
        onPanResponderTerminate: () => detachDragConstraint(),
      }),
    [attachDragConstraint, detachDragConstraint, updateDragConstraint],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.heroCard}>
        <View style={styles.heroIconWrapper}>
          <MaterialCommunityIcons name="raccoon" size={54} color="#f0fdf4" />
        </View>
        <View style={styles.heroTextWrapper}>
          <Text style={styles.heroTitle}>Raccoon Radar</Text>
          <Text style={styles.heroSubtitle}>
            Every 0.5 kg logged spawns new trash. Drag anything around and gravity will settle it.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>This Week&apos;s Haul</Text>
          <Text style={styles.summaryValue}>{currentWeekWeight.toFixed(1)} kg</Text>
          <Text style={styles.summaryHint}>Pile resets in {daysUntilReset} days</Text>
        </View>
        <View style={styles.summaryIcon}>
          <MaterialCommunityIcons name="refresh-auto" size={28} color="#10b981" />
        </View>
      </View>

      <View style={styles.pileCard}>
        <View style={styles.pileHeader}>
          <Text style={styles.pileTitle}>Garbage Pile</Text>
          <Text style={styles.pileHint}>
            Starts with {STARTING_IMAGES} pieces. Every additional {WEIGHT_STEP_KG} kg adds another image.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Crunching this week&apos;s trash...</Text>
          </View>
        ) : (
          <View style={styles.pileCanvasWrapper}>
            <View style={styles.pileCanvas} onLayout={handlePileLayout} {...panResponder.panHandlers}>
              <View style={StyleSheet.absoluteFill}>
                {renderPieces.map((piece) => (
                  <Image
                    key={piece.id}
                    source={piece.source}
                    resizeMode="contain"
                    style={[
                      styles.garbageSprite,
                      {
                        width: piece.width,
                        height: piece.height,
                        transform: [
                          { translateX: piece.x - piece.width / 2 },
                          { translateY: piece.y - piece.height / 2 },
                          { rotate: `${piece.angle}rad` },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        <Text style={styles.pileFooter}>
          Matter.js keeps collisions realistic so trash never clips through the pile or the panel.
        </Text>
      </View>

      <View style={styles.weekSection}>
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>Weekly Breakdown</Text>
          <Text style={styles.weekSubtitle}>
            Compare the last {WEEKS_TO_DISPLAY} weeks of trash collected.
          </Text>
        </View>

        {weeklyTotals.map((week) => {
          const percent = maxWeeklyWeight === 0 ? 0 : Math.min(100, (week.weight / maxWeeklyWeight) * 100);
          const width = week.weight === 0 ? '0%' : `${Math.max(10, percent)}%`;
          return (
            <View key={week.key} style={styles.weekCard}>
              <View style={styles.weekCardHeader}>
                <View>
                  <Text style={styles.weekLabel}>{week.label}</Text>
                  <Text style={styles.weekRange}>{week.rangeLabel}</Text>
                </View>
                <Text style={styles.weekValue}>{week.weight.toFixed(1)} kg</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width }]} />
              </View>
              <View style={styles.weekIcons}>
                <MaterialCommunityIcons name="trash-can" size={18} color="#475569" />
                <MaterialCommunityIcons name="recycle" size={18} color="#22c55e" />
                <MaterialCommunityIcons name="bottle-soda" size={18} color="#0f172a" />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const getWeekStart = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const mondayOffset = (day + 6) % 7;
  copy.setDate(copy.getDate() - mondayOffset);
  return copy;
};

const formatWeekRange = (start: Date) => {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${startLabel} - ${endLabel}`;
};

const getDaysUntilReset = (date: Date) => {
  const daysSinceMonday = (date.getDay() + 6) % 7;
  return daysSinceMonday === 0 ? 7 : 7 - daysSinceMonday;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#f8fafc',
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconWrapper: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(248,250,252,0.9)',
    fontSize: 15,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },
  summaryHint: {
    color: '#475569',
    marginTop: 4,
  },
  summaryIcon: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 16,
    padding: 14,
  },
  pileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  pileHeader: {
    marginBottom: 16,
  },
  pileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  pileHint: {
    color: '#475569',
    marginTop: 4,
  },
  pileCanvasWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0f172a10',
    height: 280,
  },
  pileCanvas: {
    flex: 1,
  },
  garbageSprite: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  pileFooter: {
    textAlign: 'center',
    color: '#475569',
    marginTop: 16,
    fontStyle: 'italic',
  },
  loadingState: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#475569',
  },
  weekSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },
  weekHeader: {
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  weekSubtitle: {
    color: '#475569',
    marginTop: 4,
  },
  weekCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekLabel: {
    fontWeight: '600',
    color: '#0f172a',
  },
  weekRange: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  weekValue: {
    fontWeight: '700',
    color: '#10b981',
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#10b981',
  },
  weekIcons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
});

export default GarbageVisualizerScreen;
