import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import mascara from '../css/style';
import {
  ChamadoStatus,
  ChamadoSuporte,
  RespostaChamado,
  atualizarStatusChamado,
  isAdminEmail,
  listarChamadosAdmin,
  listarRespostasChamado,
  responderChamado,
} from '../services/supportService';
import { settingsStyles } from './styles';

function formatarData(valor: unknown) {
  const seconds = (valor as { seconds?: number })?.seconds;
  const data = seconds ? new Date(seconds * 1000) : null;
  return data ? data.toLocaleString('pt-BR') : 'Agora';
}

export default function SuporteAdmin() {
  const router = useRouter();
  const { user } = useAuth();
  const admin = isAdminEmail(user?.email);
  const [chamados, setChamados] = useState<ChamadoSuporte[]>([]);
  const [selecionado, setSelecionado] = useState<ChamadoSuporte | null>(null);
  const [respostas, setRespostas] = useState<RespostaChamado[]>([]);
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!admin) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const lista = await listarChamadosAdmin(user);
      setChamados(lista);
    } catch (error) {
      console.warn('Erro ao carregar painel de suporte:', error);
      Alert.alert('Erro', 'Nao foi possivel carregar os chamados.');
    } finally {
      setCarregando(false);
    }
  }, [admin, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function abrir(chamado: ChamadoSuporte) {
    setSelecionado(chamado);
    setRespostas(await listarRespostasChamado(chamado.id));
  }

  async function enviarResposta() {
    if (!user || !selecionado || !resposta.trim()) return;
    try {
      setSalvando(true);
      await responderChamado({
        chamadoId: selecionado.id,
        user,
        mensagem: resposta.trim(),
        admin: true,
      });
      setResposta('');
      await carregar();
      const listaRespostas = await listarRespostasChamado(selecionado.id);
      setRespostas(listaRespostas);
      setSelecionado((atual) => atual ? { ...atual, status: 'respondido' } : atual);
      Alert.alert('Resposta enviada', 'O usuario ja pode ver sua resposta em Meus Chamados.');
    } catch (error) {
      console.warn('Erro ao responder como admin:', error);
      Alert.alert('Erro', 'Nao foi possivel responder o chamado.');
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(status: ChamadoStatus) {
    if (!selecionado) return;
    try {
      await atualizarStatusChamado(selecionado.id, status);
      await carregar();
      setSelecionado((atual) => atual ? { ...atual, status } : atual);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel atualizar o status.');
    }
  }

  if (!admin) {
    return (
      <View style={[mascara.container, settingsStyles.page]}>
        <View style={styles.panel}>
          <Text style={styles.title}>Acesso restrito</Text>
          <Text style={styles.text}>Esta area e exclusiva para administradores.</Text>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={styles.primaryButton}>
            <Text style={styles.buttonText}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={[settingsStyles.scrollContent, { justifyContent: 'flex-start' }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/(tabs)/perfil')} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#bfc0d1" />
          </Pressable>
          <Text style={styles.title}>Painel de Suporte</Text>
          <Pressable onPress={carregar} style={styles.iconButton}>
            <MaterialCommunityIcons name="refresh" size={20} color="#bfc0d1" />
          </Pressable>
        </View>

        {carregando ? <ActivityIndicator color="#a855f7" /> : null}

        {chamados.map((chamado) => (
          <Pressable key={chamado.id} style={styles.panel} onPress={() => abrir(chamado)}>
            <View style={styles.row}>
              <Text style={styles.panelTitle}>#{chamado.id.slice(0, 6)} - {chamado.nome}</Text>
              <Text style={styles.status}>{chamado.status}</Text>
            </View>
            <Text style={styles.muted}>{chamado.email} | {formatarData(chamado.criadoEm)}</Text>
            <Text style={styles.text}>{chamado.mensagem}</Text>
          </Pressable>
        ))}

        {selecionado ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Responder chamado #{selecionado.id.slice(0, 6)}</Text>
            <Text style={styles.muted}>{selecionado.nome} - {selecionado.email}</Text>
            <View style={styles.messageBox}>
              <Text style={styles.author}>Usuario</Text>
              <Text style={styles.text}>{selecionado.mensagem}</Text>
            </View>
            {respostas.map((item) => (
              <View key={item.id} style={[styles.messageBox, item.autorTipo === 'admin' && styles.adminMessage]}>
                <Text style={styles.author}>{item.autorTipo === 'admin' ? 'Suporte' : item.autorNome}</Text>
                <Text style={styles.text}>{item.mensagem}</Text>
                <Text style={styles.muted}>{formatarData(item.criadoEm)}</Text>
              </View>
            ))}
            <TextInput
              value={resposta}
              onChangeText={setResposta}
              multiline
              placeholder="Escreva a resposta para o usuario"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
            <Pressable style={styles.primaryButton} onPress={enviarResposta} disabled={salvando}>
              {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Responder como suporte</Text>}
            </Pressable>
            <View style={styles.statusRow}>
              {(['em_andamento', 'respondido', 'fechado'] as ChamadoStatus[]).map((status) => (
                <Pressable key={status} style={styles.statusButton} onPress={() => mudarStatus(status)}>
                  <Text style={styles.statusButtonText}>{status}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { width: '100%', maxWidth: 900, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', flex: 1 },
  iconButton: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#212636', borderWidth: 1, borderColor: '#2e354d', alignItems: 'center', justifyContent: 'center' },
  panel: { width: '100%', maxWidth: 900, alignSelf: 'center', backgroundColor: '#212636', borderWidth: 1, borderColor: '#2e354d', borderRadius: 8, padding: 14, marginBottom: 10, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  panelTitle: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  status: { color: '#47d18c', fontWeight: '700', textTransform: 'capitalize' },
  text: { color: '#bfc0d1', lineHeight: 20 },
  muted: { color: '#9ca3af', fontSize: 12 },
  messageBox: { backgroundColor: '#1a1f2e', borderRadius: 8, padding: 10, gap: 4 },
  adminMessage: { borderWidth: 1, borderColor: '#47d18c' },
  author: { color: '#fff', fontWeight: '700' },
  input: { minHeight: 90, backgroundColor: '#0c101c', borderWidth: 1, borderColor: '#60519b', borderRadius: 8, color: '#bfc0d1', padding: 12, textAlignVertical: 'top' },
  primaryButton: { backgroundColor: '#60519b', borderRadius: 8, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: { borderWidth: 1, borderColor: '#836fd1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  statusButtonText: { color: '#bfc0d1', fontSize: 12 },
});
