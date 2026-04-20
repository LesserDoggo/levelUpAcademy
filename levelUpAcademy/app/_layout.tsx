// =============================================================================
// LEVELUP ACADEMY — app/_layout.tsx
// CORREÇÃO #4: AuthGuard aguarda carregando=false antes de redirecionar.
// Sem isso o app acessava Firestore sem uid → "Missing or insufficient permissions".
// =============================================================================

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from './context/AuthContext';

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { user, carregando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Não age enquanto Firebase ainda verifica a sessão
    if (carregando) return;

    const emRotaAuth = segments[0] === '(auth)';

    if (!user && !emRotaAuth) {
      router.replace('/(auth)/telaLogin');
    } else if (user && emRotaAuth) {
      router.replace('/(tabs)/home');
    }
  }, [user, carregando, segments, router]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { carregando } = useAuth();

  const [fontsLoaded, fontError] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('transparent');
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !carregando) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, carregando]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar translucent backgroundColor="transparent" style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
