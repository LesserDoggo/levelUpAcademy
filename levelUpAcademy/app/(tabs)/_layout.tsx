import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import { setStatusBarHidden, StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, DimensionValue, Platform, StatusBar as RNStatusBar, View } from 'react-native';

export default function TabLayout() {
  const [dimensions, setDimensions] = useState<{ width: DimensionValue, height: DimensionValue }>({
    width: '100%',
    height: '100%'
  });

  const applyImmersive = async () => {
    // SÓ EXECUTA SE FOR ANDROID
    if (Platform.OS === 'android') {
      try {
        await NavigationBar.setVisibilityAsync('hidden');

        RNStatusBar.setHidden(true, 'none');
        RNStatusBar.setTranslucent(true);
      } catch (e) {
        console.log("Erro ao aplicar modo imersivo:", e);
      }
    }
  };

  useEffect(() => {
    // Esconder status bar (Funciona em iOS/Android, ignorado na Web)
    if (Platform.OS !== 'web') {
      setStatusBarHidden(true, 'none');
    }

    applyImmersive();

    // LISTENERS: Só registrar se NÃO for Web
    if (Platform.OS === 'android') {
      const navListener = NavigationBar.addVisibilityListener(({ visibility }) => {
        if (visibility === 'visible') applyImmersive();
      });

      const appStateListener = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') applyImmersive();
      });

      return () => {
        navListener.remove();
        appStateListener.remove();
      };
    }
  }, []);

  return (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        flex: 1,
        backgroundColor: '#000'
      }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setDimensions({ width, height });
      }}
    >
      <StatusBar hidden={true} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none', position: 'absolute' },
        }}
      />
    </View>
  );
}