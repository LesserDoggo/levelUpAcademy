import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import animationData from '../assets/images/LevelUp_fixed.json';

const androidAnimationData = {
  ...animationData,
  fonts: { list: [] },
};

export default function SplashLogo() {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      animationRef.current?.play();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <LottieView
        ref={animationRef}
        source={androidAnimationData}
        autoPlay
        loop
        renderMode="SOFTWARE"
        resizeMode="contain"
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
