import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import mascara from '../css/style';
import { settingsStyles } from './styles';

export default function FaleConosco() {
  const router = useRouter();
  const { user } = useAuth();
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    if (!mensagem.trim()) {
      Alert.alert('Mensagem obrigatoria', 'Descreva sua solicitacao.');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Sessao invalida', 'Entre novamente para enviar sua mensagem.');
      return;
    }

    try {
      setCarregando(true);
      await updateDoc(doc(db, 'usuarios', user.uid), {
        solicitacoesSuporte: arrayUnion({
          id: `${Date.now()}`,
          uid: user.uid,
          email: user.email ?? null,
          mensagem: mensagem.trim(),
          status: 'novo',
          criadoEm: new Date().toISOString(),
        }),
      });

      Alert.alert('Enviado', 'Sua mensagem foi salva no seu perfil e pode ser consultada no Firestore em usuarios/{uid}.');
      setMensagem('');
    } catch (error: any) {
      const mensagemErro = error?.code === 'permission-denied'
        ? 'O Firestore bloqueou a gravação. Verifique as regras da coleção usuarios.'
        : 'Nao foi possivel enviar sua mensagem.';
      Alert.alert('Erro', mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={settingsStyles.scrollContent}>
        <View style={settingsStyles.card}>
          <Text style={settingsStyles.title}>Fale Conosco</Text>
          <Text style={settingsStyles.text}>Envie sua duvida ou problema. Nesta versao, a mensagem fica registrada no documento do seu usuario.</Text>
          <TextInput
            value={mensagem}
            onChangeText={setMensagem}
            multiline
            numberOfLines={6}
            placeholder="Escreva sua mensagem"
            placeholderTextColor="#bfc0d1"
            style={[mascara.inputTexto, { minHeight: 140, textAlignVertical: 'top', width: '100%' }]}
          />
          <Pressable onPress={enviar} style={[settingsStyles.button, settingsStyles.primaryButton]}>
            {carregando ? <ActivityIndicator color="white" /> : <Text style={settingsStyles.primaryButtonText}>Enviar</Text>}
          </Pressable>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={[settingsStyles.button, settingsStyles.secondaryButton]}>
            <Text style={settingsStyles.secondaryButtonText}>Voltar para o perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
