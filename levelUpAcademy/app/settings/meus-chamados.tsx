import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import mascara from '../css/style';
import {
  ChamadoSuporte,
  RespostaChamado,
  listarMeusChamados,
  listarRespostasChamado,
  responderChamado,
} from '../services/supportService';
import { settingsStyles } from './styles';

function formatarData(valor: unknown) {
  const seconds = (valor as { seconds?: number })?.seconds;
  const data = seconds ? new Date(seconds * 1000) : null;
  return data ? data.toLocaleString('pt-BR') : 'Agora';
}

export default function MeusChamados() {
  const router = useRouter();
  const { user } = useAuth();
  const [chamados, setChamados] = useState<ChamadoSuporte[]>([]);
  const [selecionado, setSelecionado] = useState<ChamadoSuporte | null>(null);
  const [respostas, setRespostas] = useState<RespostaChamado[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    if (!user?.uid) return;
    setCarregando(true);
    try {
      const lista = await listarMeusChamados(user.uid);
      setChamados(lista);
    } catch (error) {
      console.warn('Erro ao carregar chamados:', error);
      Alert.alert('Erro', 'Nao foi possivel carregar seus chamados.');
    } finally {
      setCarregando(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function abrirChamado(chamado: ChamadoSuporte) {
    setSelecionado(chamado);
    setRespostas(await listarRespostasChamado(chamado.id));
  }

  async function responder() {
    if (!user || !selecionado || !mensagem.trim()) return;
    try {
      setEnviando(true);
      await responderChamado({
        chamadoId: selecionado.id,
        user,
        mensagem: mensagem.trim(),
        admin: false,
      });
      setMensagem('');
      setRespostas(await listarRespostasChamado(selecionado.id));
      await carregar();
    } catch (error) {
      console.warn('Erro ao responder chamado:', error);
      Alert.alert('Erro', 'Nao foi possivel enviar sua resposta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={[settingsStyles.scrollContent, { justifyContent: 'flex-start' }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#bfc0d1" />
          </Pressable>
          <Text style={styles.title}>Meus Chamados</Text>
          <Pressable onPress={carregar} style={styles.iconButton}>
            <MaterialCommunityIcons name="refresh" size={20} color="#bfc0d1" />
          </Pressable>
        </View>

        {carregando ? <ActivityIndicator color="#a855f7" /> : null}

        {chamados.length === 0 && !carregando ? (
          <View style={styles.panel}>
            <Text style={styles.muted}>Voce ainda nao abriu chamados de suporte.</Text>
          </View>
        ) : null}

        {chamados.map((chamado) => (
          <Pressable key={chamado.id} style={styles.panel} onPress={() => abrirChamado(chamado)}>
            <View style={styles.row}>
              <Text style={styles.panelTitle}>#{chamado.id.slice(0, 6)}</Text>
              <Text style={styles.status}>{chamado.status}</Text>
            </View>
            <Text style={styles.text}>{chamado.mensagem}</Text>
            <Text style={styles.muted}>{formatarData(chamado.criadoEm)}</Text>
          </Pressable>
        ))}

        {selecionado ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Conversa do chamado</Text>
            <View style={styles.messageBox}>
              <Text style={styles.author}>Voce</Text>
              <Text style={styles.text}>{selecionado.mensagem}</Text>
            </View>
            {respostas.map((resposta) => (
              <View key={resposta.id} style={[styles.messageBox, resposta.autorTipo === 'admin' && styles.adminMessage]}>
                <Text style={styles.author}>{resposta.autorTipo === 'admin' ? 'Suporte' : 'Voce'}</Text>
                <Text style={styles.text}>{resposta.mensagem}</Text>
                <Text style={styles.muted}>{formatarData(resposta.criadoEm)}</Text>
              </View>
            ))}
            {selecionado.status !== 'fechado' ? (
              <>
                <TextInput
                  value={mensagem}
                  onChangeText={setMensagem}
                  multiline
                  placeholder="Responder ao suporte"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
                <Pressable style={styles.primaryButton} onPress={responder} disabled={enviando}>
                  {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar resposta</Text>}
                </Pressable>
              </>
            ) : (
              <Text style={styles.muted}>Este chamado foi fechado.</Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', flex: 1 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#212636',
    borderWidth: 1,
    borderColor: '#2e354d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    backgroundColor: '#212636',
    borderWidth: 1,
    borderColor: '#2e354d',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  panelTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  status: { color: '#47d18c', fontWeight: '700', textTransform: 'capitalize' },
  text: { color: '#bfc0d1', lineHeight: 20 },
  muted: { color: '#9ca3af', fontSize: 12 },
  messageBox: { backgroundColor: '#1a1f2e', borderRadius: 8, padding: 10, gap: 4 },
  adminMessage: { borderWidth: 1, borderColor: '#47d18c' },
  author: { color: '#fff', fontWeight: '700' },
  input: {
    minHeight: 90,
    backgroundColor: '#0c101c',
    borderWidth: 1,
    borderColor: '#60519b',
    borderRadius: 8,
    color: '#bfc0d1',
    padding: 12,
    textAlignVertical: 'top',
  },
  primaryButton: { backgroundColor: '#60519b', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
