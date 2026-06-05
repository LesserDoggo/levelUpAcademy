import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import animationData from '../assets/images/LevelUp_fixed.json';

export default function SplashLogo() {
  return (
    <View style={styles.container} pointerEvents="none">
      <LottieView
        source={animationData}
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
    backgroundColor: 'transparent',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
