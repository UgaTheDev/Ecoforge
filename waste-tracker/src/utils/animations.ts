import { Animated, Easing } from 'react-native';

export const createPulseAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

export const createFadeIn = (animatedValue: Animated.Value, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration: 600,
    delay,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

export const createSlideUp = (animatedValue: Animated.Value, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: 500,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

export const createBounce = (animatedValue: Animated.Value) => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    friction: 4,
    tension: 40,
    useNativeDriver: true,
  });
};
