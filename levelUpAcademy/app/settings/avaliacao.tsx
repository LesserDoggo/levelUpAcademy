import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import mascara from '../css/style';
import { enviarCopiaAvaliacao } from '../services/emailService';
import { settingsStyles } from './styles';

export default function Avaliacao() {
  const router = useRouter();
  const { user } = useAuth();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviarAvaliacao() {
    if (nota < 1) {
      Alert.alert('Nota obrigatoria', 'Selecione de 1 a 5 estrelas.');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Sessao invalida', 'Entre novamente para enviar sua avaliacao.');
      return;
    }
    try {
      setEnviando(true);
      await updateDoc(doc(db, 'usuarios', user.uid), {
        avaliacoesApp: arrayUnion({
          id: `${Date.now()}`,
          uid: user.uid,
          nota,
          comentario: comentario.trim(),
          criadoEm: new Date().toISOString(),
        }),
      });
      let emailEnviado = false;
      if (user.email) {
        try {
          await enviarCopiaAvaliacao({
            email: user.email,
            nome: user.displayName,
            nota,
            comentario: comentario.trim(),
          });
          emailEnviado = true;
        } catch (emailError) {
          console.warn('Nao foi possivel enfileirar e-mail de avaliacao:', emailError);
        }
      }
      setNota(0);
      setComentario('');
      Alert.alert(
        'Obrigado!',
        emailEnviado
          ? 'Sua avaliacao foi salva e enviamos uma copia para seu e-mail.'
          : 'Sua avaliacao foi salva. Nao foi possivel enfileirar o e-mail de copia agora.'
      );
    } catch (error: any) {
      const mensagemErro = error?.code === 'permission-denied'
        ? 'O Firestore bloqueou a gravacao. Verifique as regras da colecao usuarios.'
        : 'Nao foi possivel enviar sua avaliacao.';
      Alert.alert('Erro', mensagemErro);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={settingsStyles.scrollContent}>
        <View style={settingsStyles.card}>
          <Text style={settingsStyles.title}>Avalie o App</Text>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((estrela) => (
              <Pressable key={estrela} onPress={() => setNota(estrela)}>
                <MaterialCommunityIcons
                  name={nota >= estrela ? 'star' : 'star-outline'}
                  size={34}
                  color="#ffd700"
                />
              </Pressable>
            ))}
          </View>
          <TextInput
            value={comentario}
            onChangeText={setComentario}
            placeholder="Comentario (opcional)"
            placeholderTextColor="#bfc0d1"
            multiline
            style={[mascara.inputTexto, { width: '100%', minHeight: 120, textAlignVertical: 'top' }]}
          />
          <Pressable onPress={enviarAvaliacao} style={[settingsStyles.button, settingsStyles.primaryButton]}>
            {enviando ? <ActivityIndicator color="white" /> : <Text style={settingsStyles.primaryButtonText}>Enviar avaliacao</Text>}
          </Pressable>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={[settingsStyles.button, settingsStyles.secondaryButton]}>
            <Text style={settingsStyles.secondaryButtonText}>Voltar para o perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
