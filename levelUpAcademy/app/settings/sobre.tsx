import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import mascara from '../css/style';
import { settingsStyles } from './styles';

export default function SobreApp() {
  const router = useRouter();

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={settingsStyles.scrollContent}>
        <View style={settingsStyles.card}>
          <Text style={settingsStyles.title}>Sobre o App</Text>
          <Text style={settingsStyles.text}>
            LevelUp Academy v1.0.0. Plataforma mobile para trilhas de aprendizagem, desafios e recompensas.
          </Text>
          <Text style={settingsStyles.text}>
            Stack: React Native + Expo + Firebase. Desenvolvido para o projeto academico de Startup ADS 2026.
          </Text>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={[settingsStyles.button, settingsStyles.primaryButton]}>
            <Text style={settingsStyles.primaryButtonText}>Voltar para o perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
