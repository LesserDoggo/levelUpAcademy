import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import mascara from '../css/style';

export default function Avaliacao() {
  const { user } = useAuth();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviarAvaliacao() {
    if (nota < 1) {
      Alert.alert('Nota obrigatoria', 'Selecione de 1 a 5 estrelas.');
      return;
    }
    try {
      setEnviando(true);
      await addDoc(collection(db, 'avaliacoes'), {
        uid: user?.uid ?? null,
        nota,
        comentario: comentario.trim(),
        criadoEm: serverTimestamp(),
      });
      setNota(0);
      setComentario('');
      Alert.alert('Obrigado!', 'Sua avaliacao foi registrada com sucesso.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel enviar sua avaliacao.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={[mascara.container, { padding: 20, paddingTop: 60, gap: 12 }]}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Avalie o App</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
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
      <Pressable onPress={enviarAvaliacao} style={{ backgroundColor: '#a855f7', padding: 12, borderRadius: 8 }}>
        {enviando ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Enviar avaliacao</Text>}
      </Pressable>
    </View>
  );
}
