import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import mascara from '../css/style';
import { settingsStyles } from './styles';

export default function TermosUso() {
  const router = useRouter();

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={settingsStyles.scrollContent}>
        <View style={settingsStyles.card}>
          <Text style={settingsStyles.title}>Termos de Uso</Text>
          <Text style={settingsStyles.text}>
            Ao utilizar o LevelUp Academy, voce concorda em usar a plataforma para fins educacionais, sem compartilhar credenciais
            e sem enviar conteudo malicioso ou ofensivo.
          </Text>
          <Text style={settingsStyles.text}>
            Podemos atualizar funcionalidades e regras para melhorar seguranca e estabilidade. O uso continuado apos mudancas
            significa aceite dos termos atualizados.
          </Text>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={[settingsStyles.button, settingsStyles.primaryButton]}>
            <Text style={settingsStyles.primaryButtonText}>Voltar para o perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
