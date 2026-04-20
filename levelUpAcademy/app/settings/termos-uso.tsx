import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import mascara from '../css/style';

export default function TermosUso() {
  const router = useRouter();

  return (
    <View style={[mascara.container, { padding: 20, paddingTop: 60 }]}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Termos de Uso</Text>
        <Text style={{ color: '#bfc0d1', lineHeight: 20 }}>
          Ao utilizar o LevelUp Academy, voce concorda em usar a plataforma para fins educacionais, sem compartilhar credenciais
          e sem enviar conteudo malicioso ou ofensivo.
        </Text>
        <Text style={{ color: '#bfc0d1', lineHeight: 20 }}>
          Podemos atualizar funcionalidades e regras para melhorar seguranca e estabilidade. O uso continuado apos mudancas
          significa aceite dos termos atualizados.
        </Text>
        <Pressable onPress={() => router.back()} style={{ backgroundColor: '#a855f7', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
