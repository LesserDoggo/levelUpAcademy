import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#06060f' },
      }}
    >
      <Stack.Screen name="politica-privacidade" options={{ title: 'Politica de Privacidade' }} />
      <Stack.Screen name="termos-uso" options={{ title: 'Termos de Uso' }} />
      <Stack.Screen name="fale-conosco" options={{ title: 'Fale Conosco' }} />
      <Stack.Screen name="sobre" options={{ title: 'Sobre o Aplicativo' }} />
      <Stack.Screen name="avaliacao" options={{ title: 'Avaliar o App' }} />
    </Stack>
  );
}
