import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import mascara from '../css/style';

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
    try {
      setCarregando(true);
      await addDoc(collection(db, 'suporte'), {
        uid: user?.uid ?? null,
        email: user?.email ?? null,
        mensagem: mensagem.trim(),
        criadoEm: serverTimestamp(),
      });
      setMensagem('');
      Alert.alert('Enviado', 'Recebemos sua mensagem e responderemos em breve.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel enviar sua mensagem.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={[mascara.container, { padding: 20, paddingTop: 60 }]}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Fale Conosco</Text>
        <Text style={{ color: '#bfc0d1' }}>Envie sua duvida ou problema. Nao utilizamos FAQ nesta versao.</Text>
        <TextInput
          value={mensagem}
          onChangeText={setMensagem}
          multiline
          numberOfLines={6}
          placeholder="Escreva sua mensagem"
          placeholderTextColor="#bfc0d1"
          style={[mascara.inputTexto, { minHeight: 140, textAlignVertical: 'top', width: '100%' }]}
        />
        <Pressable onPress={enviar} style={{ backgroundColor: '#a855f7', padding: 12, borderRadius: 8 }}>
          {carregando ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Enviar</Text>}
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ borderColor: '#a855f7', borderWidth: 1, padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#a855f7', textAlign: 'center', fontWeight: '600' }}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
