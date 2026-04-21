import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import mascara from '../css/style';
import { settingsStyles } from './styles';

export default function PoliticaPrivacidade() {
  const router = useRouter();

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={settingsStyles.scrollContent}>
        <View style={settingsStyles.card}>
          <Text style={settingsStyles.title}>Politica de Privacidade</Text>
          <Text style={settingsStyles.text}>
            Tratamos seus dados para autenticar sua conta, personalizar sua experiencia e registrar seu progresso academico.
            Coletamos apenas dados necessarios: nome, email, avatar e uso do aplicativo.
          </Text>
          <Text style={settingsStyles.text}>
            Seus dados sao armazenados com controles de acesso e voce pode solicitar exclusao da conta diretamente na tela Minha Conta.
            Esta politica segue os principios da LGPD: finalidade, necessidade, transparencia e seguranca.
          </Text>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={[settingsStyles.button, settingsStyles.primaryButton]}>
            <Text style={settingsStyles.primaryButtonText}>Voltar para o perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
