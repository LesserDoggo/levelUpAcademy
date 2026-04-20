import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import mascara from '../css/style';

export default function SobreApp() {
  const router = useRouter();

  return (
    <View style={[mascara.container, { padding: 20, paddingTop: 60, gap: 12 }]}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Sobre o App</Text>
      <Text style={{ color: '#bfc0d1', lineHeight: 20 }}>
        LevelUp Academy v1.0.0. Plataforma mobile para trilhas de aprendizagem, desafios e recompensas.
      </Text>
      <Text style={{ color: '#bfc0d1', lineHeight: 20 }}>
        Stack: React Native + Expo + Firebase. Desenvolvido para o projeto academico de Startup ADS 2026.
      </Text>
      <Pressable onPress={() => router.back()} style={{ backgroundColor: '#a855f7', padding: 12, borderRadius: 8, marginTop: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Voltar</Text>
      </Pressable>
    </View>
  );
}
