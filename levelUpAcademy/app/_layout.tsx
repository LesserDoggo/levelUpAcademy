import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { useFonts } from 'expo-font';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Manter a splash screen visível enquanto carregamos os recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('transparent');
    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('overlay-swipe');
    NavigationBar.setBackgroundColorAsync('transparent');
    NavigationBar.setPositionAsync('absolute');
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Impedir renderização até as fontes estarem carregadas
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar translucent backgroundColor="transparent" style="light" />
    </ThemeProvider>
  );
}
