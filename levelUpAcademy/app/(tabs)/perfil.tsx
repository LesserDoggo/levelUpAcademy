// =============================================================================
// LEVELUP ACADEMY — app/(tabs)/perfil.tsx
// CORREÇÃO #2: Logout e Exclusão de Conta funcionam na web e mobile.
// - deleteUser requer reautenticação recente (adicionado fluxo de senha)
// - updateDoc usa uid correto vindo do AuthContext
// - Suporte a window.confirm/prompt para compatibilidade Web
// =============================================================================

import MenuInf from '@/components/Menu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import {
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { buscarDadosUsuario, deslogarUsuario, UsuarioFirestore } from '../services/authService';

export default function Perfil() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const router = useRouter();

    const { user, dadosUsuario: dadosCtx, recarregarDados } = useAuth();

    const [usuario, setUsuario] = useState<UsuarioFirestore | null>(dadosCtx);
    const [carregando, setCarregando] = useState(!dadosCtx);
    const [salvando, setSalvando] = useState(false);
    const [editando, setEditando] = useState(false);
    const [nomeEdit, setNomeEdit] = useState(dadosCtx?.nome ?? '');
    const [bioEdit, setBioEdit] = useState(dadosCtx?.bio ?? '');

    useEffect(() => {
        if (dadosCtx) {
            setUsuario(dadosCtx);
            setNomeEdit(dadosCtx.nome);
            setBioEdit(dadosCtx.bio);
            setCarregando(false);
        } else if (user) {
            buscarDadosUsuario(user.uid).then((d) => {
                if (d) { setUsuario(d); setNomeEdit(d.nome); setBioEdit(d.bio); }
                setCarregando(false);
            });
        }
    }, [dadosCtx, user]);

    // ── Salvar edições ──────────────────────────────────────────────────────
    async function handleSalvar() {
        if (!usuario || !user) return;
        setSalvando(true);
        try {
            await updateDoc(doc(db, 'usuarios', user.uid), {
                nome: nomeEdit.trim(),
                bio: bioEdit.trim(),
                atualizadoEm: serverTimestamp(),
            });
            setUsuario({ ...usuario, nome: nomeEdit.trim(), bio: bioEdit.trim() });
            await recarregarDados();
            setEditando(false);
            Alert.alert('✅ Perfil atualizado com sucesso!');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar. Verifique sua conexão.');
        }
        setSalvando(false);
    }

    function handleCancelar() {
        if (usuario) { setNomeEdit(usuario.nome); setBioEdit(usuario.bio); }
        setEditando(false);
    }

    // ── Logout ──────────────────────────────────────────────────────────────
    const handleLogout = () => {
        const acaoSair = async () => {
            await deslogarUsuario();
            router.replace('/(auth)/telaLogin');
        };

        if (Platform.OS === 'web') {
            const confirmar = window.confirm("Deseja realmente sair?");
            if (confirmar) acaoSair();
        } else {
            Alert.alert("Sair", "Deseja realmente sair?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: 'destructive', onPress: acaoSair }
            ]);
        }
    };

    // ── Excluir conta ───────────────────────────────────────────────────────
    const handleExcluirConta = () => {
        if (Platform.OS === 'web') {
            const confirmar = window.confirm("ATENÇÃO: Esta ação é irreversível. Todos os seus dados serão apagados. Deseja continuar para a reautenticação?");
            if (confirmar) solicitarSenhaParaExcluir();
        } else {
            Alert.alert(
                '⚠️ Excluir Conta',
                'Esta ação é irreversível. Todos os seus dados e progresso serão apagados permanentemente.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Prosseguir', style: 'destructive', onPress: () => solicitarSenhaParaExcluir() },
                ]
            );
        }
    };

    function solicitarSenhaParaExcluir() {
        if (Platform.OS === 'web') {
            const senha = window.prompt("Para sua segurança, digite sua senha para confirmar a exclusão da conta:");
            if (senha) confirmarExclusao(senha);
        } else {
            Alert.prompt(
                'Confirmar exclusão',
                'Digite sua senha para confirmar:',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir', style: 'destructive',
                        onPress: (senha?: string) => { if (senha) confirmarExclusao(senha); },
                    },
                ],
                'secure-text'
            );
        }
    }

    async function confirmarExclusao(senha: string) {
        if (!user || !user.email) return;
        try {
            const credential = EmailAuthProvider.credential(user.email, senha);
            await reauthenticateWithCredential(user, credential);

            await deleteDoc(doc(db, 'usuarios', user.uid));
            await deleteUser(user);

            Alert.alert('Conta excluída', 'Sua conta foi removida com sucesso.');
            router.replace('/(auth)/telaLogin');
        } catch (e: any) {
            if (e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential') {
                Alert.alert('Senha incorreta', 'A senha informada está errada. Tente novamente.');
            } else {
                Alert.alert('Erro', 'Não foi possível excluir a conta. Talvez sua sessão tenha expirado.');
            }
        }
    }

    // ── Alterar senha ───────────────────────────────────────────────────────
    function handleAlterarSenha() {
        if (Platform.OS === 'web') {
            const senhaAtual = window.prompt("Digite sua senha atual:");
            if (!senhaAtual) return;
            const novaSenha = window.prompt("Digite a nova senha (mín. 6 caracteres):");
            if (novaSenha) executarTrocaSenha(senhaAtual, novaSenha);
        } else {
            Alert.prompt(
                'Senha atual',
                'Digite sua senha atual:',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Próximo',
                        onPress: (senhaAtual?: string) => {
                            if (!senhaAtual) return;
                            Alert.prompt(
                                'Nova senha',
                                'Digite a nova senha:',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Salvar',
                                        onPress: (novaSenha?: string) => {
                                            if (novaSenha) executarTrocaSenha(senhaAtual, novaSenha);
                                        },
                                    },
                                ],
                                'secure-text'
                            );
                        },
                    },
                ],
                'secure-text'
            );
        }
    }

    async function executarTrocaSenha(atual: string, nova: string) {
        if (!user?.email) return;
        try {
            const cred = EmailAuthProvider.credential(user.email, atual);
            await reauthenticateWithCredential(user, cred);
            await updatePassword(user, nova);
            Alert.alert('Sucesso', 'Senha alterada com sucesso!');
        } catch (e: any) {
            Alert.alert('Erro', 'Não foi possível alterar a senha. Verifique a senha atual.');
        }
    }

    // ── Loading ─────────────────────────────────────────────────────────────
    if (carregando) {
        return (
            <View style={[mascara.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={{ color: '#bfc0d1', marginTop: 12 }}>Carregando perfil...</Text>
            </View>
        );
    }

    if (!usuario) return null;

    return (
        <View style={[
            mascara.container,
            { flex: 1, paddingBottom: isDesktop ? 0 : 130, paddingLeft: isDesktop ? 90 : 0, paddingTop: isDesktop ? 0 : 30 },
        ]}>
            <MenuInf />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>

                <View style={conteudoStyle.cardPerfil}>
                    <View style={conteudoStyle.avatarContainer}>
                        <View style={conteudoStyle.avatar}>
                            <MaterialCommunityIcons name="account-circle" size={60} color="#60519b" />
                        </View>
                    </View>

                    {!editando ? (
                        <View style={conteudoStyle.secaoInfo}>
                            <Text style={conteudoStyle.nomeUsuario}>{usuario.nome}</Text>
                            <Text style={conteudoStyle.emailUsuario}>{usuario.email}</Text>
                            {usuario.bio
                                ? <Text style={conteudoStyle.bioUsuario}>{usuario.bio}</Text>
                                : <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>Sem bio cadastrada.</Text>
                            }
                            <Pressable style={[conteudoStyle.botaoEditar, { marginTop: 12 }]} onPress={() => setEditando(true)}>
                                <Text style={conteudoStyle.textoBotaoEditar}>✏️ Editar Perfil</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={conteudoStyle.secaoInfo}>
                            <TextInput
                                value={nomeEdit}
                                onChangeText={setNomeEdit}
                                style={mascara.inputTexto}
                                placeholder="Nome"
                                placeholderTextColor="#bfc0d1"
                            />
                            <TextInput
                                value={bioEdit}
                                onChangeText={setBioEdit}
                                style={[mascara.inputTexto, { height: 80 }]}
                                placeholder="Bio (opcional)"
                                placeholderTextColor="#bfc0d1"
                                multiline
                            />
                            <View style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 8, marginBottom: 8, width: '80%' }}>
                                <Text style={{ color: '#888', fontSize: 11 }}>
                                    🔒 E-mail e dados críticos não podem ser alterados por aqui.
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8, width: '80%' }}>
                                <Pressable style={[conteudoStyle.botaoEditar, { flex: 1 }]} onPress={handleSalvar} disabled={salvando}>
                                    {salvando
                                        ? <ActivityIndicator color="#fff" size="small" />
                                        : <Text style={conteudoStyle.textoBotaoEditar}>Salvar</Text>
                                    }
                                </Pressable>
                                <Pressable style={[conteudoStyle.botaoEditar, { flex: 1, backgroundColor: '#3a3a5c' }]} onPress={handleCancelar}>
                                    <Text style={conteudoStyle.textoBotaoEditar}>Cancelar</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>

                <View style={conteudoStyle.secaoEstatisticas}>
                    {[
                        { label: 'Nível', valor: usuario.nivel },
                        { label: 'XP Total', valor: usuario.xpTotal },
                        { label: 'Moedas', valor: usuario.moedas },
                        { label: 'Ofensiva', valor: `${usuario.diasOfensiva}d` },
                        { label: 'Cursos', valor: usuario.cursosCompletos },
                    ].map(({ label, valor }) => (
                        <View key={label} style={conteudoStyle.estatisticaItem}>
                            <Text style={conteudoStyle.estatisticaValor}>{valor}</Text>
                            <Text style={conteudoStyle.estatisticaLabel}>{label}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ padding: 16, gap: 10 }}>
                    <Pressable style={conteudoStyle.botaoAcao} onPress={handleAlterarSenha}>
                        <MaterialCommunityIcons name="lock-reset" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Alterar Senha</Text>
                    </Pressable>

                    <Pressable style={conteudoStyle.botaoAcao} onPress={() => Alert.alert('Política de Privacidade', 'Adequado à LGPD — Lei 13.709/2018.')}>
                        <MaterialCommunityIcons name="shield-account" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Política de Privacidade (LGPD)</Text>
                    </Pressable>

                    <Pressable style={conteudoStyle.botaoAcao} onPress={() => Alert.alert('Termos de Uso', 'Funcionalidade em desenvolvimento.')}>
                        <MaterialCommunityIcons name="file-document-outline" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Termos de Uso</Text>
                    </Pressable>

                    <Pressable
                        style={conteudoStyle.botaoAcao}
                        onPress={() => Alert.alert('Sobre o LevelUp Academy', 'Versão: 1.0.0\nDesenvolvedor: Equipe Startup ADS 2026.1\nPlataforma: React Native + Expo')}
                    >
                        <MaterialCommunityIcons name="information-outline" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Sobre o Aplicativo</Text>
                    </Pressable>

                    <Pressable style={[conteudoStyle.botaoAcao, { borderColor: '#ff6b35' }]} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={20} color="#ff6b35" />
                        <Text style={[conteudoStyle.textoBotaoAcao, { color: '#ff6b35' }]}>Sair da Conta</Text>
                    </Pressable>

                    <Pressable style={[conteudoStyle.botaoAcao, { borderColor: '#ff4d4d' }]} onPress={handleExcluirConta}>
                        <MaterialCommunityIcons name="account-remove" size={20} color="#ff4d4d" />
                        <Text style={[conteudoStyle.textoBotaoAcao, { color: '#ff4d4d' }]}>Excluir Conta</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}