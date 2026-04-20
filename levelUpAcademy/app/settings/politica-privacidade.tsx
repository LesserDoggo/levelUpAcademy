import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import mascara from '../css/style';

export default function PoliticaPrivacidade() {
  const router = useRouter();

  return (
    <View style={[mascara.container, { padding: 20, paddingTop: 60 }]}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Politica de Privacidade</Text>
        <Text style={{ color: '#bfc0d1', lineHeight: 20 }}>
          Tratamos seus dados para autenticar sua conta, personalizar sua experiencia e registrar seu progresso academico.
          Coletamos apenas dados necessarios: nome, email, avatar e uso do aplicativo.
        </Text>
        <Text style={{ color: '#bfc0d1', lineHeight: 20 }}>
          Seus dados sao armazenados com controles de acesso e voce pode solicitar exclusao da conta diretamente na tela Minha Conta.
          Esta politica segue os principios da LGPD: finalidade, necessidade, transparencia e seguranca.
        </Text>
        <Pressable onPress={() => router.back()} style={{ backgroundColor: '#a855f7', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
