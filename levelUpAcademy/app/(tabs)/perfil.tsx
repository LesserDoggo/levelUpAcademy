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
    Image,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

import { db, storage } from '../config/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
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
    const [canalNotificacao, setCanalNotificacao] = useState<'email' | 'push'>('email');
    const [frequenciaNotificacao, setFrequenciaNotificacao] = useState<'diaria' | 'semanal' | 'mensal'>('semanal');
    const [notificacaoAtiva, setNotificacaoAtiva] = useState(true);

    useEffect(() => {
        if (dadosCtx) {
            setUsuario(dadosCtx);
            setNomeEdit(dadosCtx.nome);
            setBioEdit(dadosCtx.bio);
            setCanalNotificacao(dadosCtx.notificacoes?.canal ?? 'email');
            setFrequenciaNotificacao(dadosCtx.notificacoes?.frequencia ?? 'semanal');
            setNotificacaoAtiva(dadosCtx.notificacoes?.habilitado ?? true);
            setCarregando(false);
        } else if (user) {
            buscarDadosUsuario(user.uid).then((d) => {
                if (d) {
                    setUsuario(d);
                    setNomeEdit(d.nome);
                    setBioEdit(d.bio);
                    setCanalNotificacao(d.notificacoes?.canal ?? 'email');
                    setFrequenciaNotificacao(d.notificacoes?.frequencia ?? 'semanal');
                    setNotificacaoAtiva(d.notificacoes?.habilitado ?? true);
                }
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
                notificacoes: {
                    canal: canalNotificacao,
                    frequencia: frequenciaNotificacao,
                    habilitado: notificacaoAtiva,
                },
                atualizadoEm: serverTimestamp(),
            });
            setUsuario({
                ...usuario,
                nome: nomeEdit.trim(),
                bio: bioEdit.trim(),
                notificacoes: {
                    canal: canalNotificacao,
                    frequencia: frequenciaNotificacao,
                    habilitado: notificacaoAtiva,
                },
            });
            await recarregarDados();
            setEditando(false);
            Alert.alert('✅ Perfil atualizado com sucesso!');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar. Verifique sua conexão.');
        }
        setSalvando(false);
    }

    async function handleUploadFoto() {
        if (!user) return;
        try {
            if (Platform.OS !== 'web') {
                const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permissao.granted) {
                    Alert.alert('Permissão necessária', 'Autorize acesso à galeria para enviar uma foto.');
                    return;
                }
            }

            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            });
            if (resultado.canceled || !resultado.assets[0]?.uri) return;
            const asset = resultado.assets[0];

            setSalvando(true);
            let arquivoParaUpload: Blob;

            if (Platform.OS === 'web' && asset.file) {
                arquivoParaUpload = asset.file as unknown as Blob;
            } else {
                const response = await fetch(asset.uri);
                arquivoParaUpload = await response.blob();
            }

            const fotoRef = ref(storage, `fotosPerfil/${user.uid}.jpg`);
            await uploadBytes(fotoRef, arquivoParaUpload, {
                contentType: asset.mimeType ?? 'image/jpeg',
            });
            const fotoUrl = await getDownloadURL(fotoRef);
            await updateDoc(doc(db, 'usuarios', user.uid), { fotoUrl, atualizadoEm: serverTimestamp() });

            setUsuario((atual) => (atual ? { ...atual, fotoUrl } : atual));
            await recarregarDados();
            Alert.alert('Sucesso', 'Foto de perfil atualizada.');
        } catch (erro: any) {
            const mensagem = erro?.message?.includes('permission')
                ? 'Sem permissão para upload. Verifique as regras do Firebase Storage.'
                : 'Não foi possível enviar a foto de perfil.';
            Alert.alert('Erro', mensagem);
        } finally {
            setSalvando(false);
        }
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
        if (user?.providerData?.some((provider) => provider.providerId === 'google.com')) {
            Alert.alert('Login com Google', 'Essa conta usa a senha da sua conta Google. Para trocar a senha, altere-a diretamente no Google.');
            return;
        }
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
        if (nova.length < 6 || !/[A-Z]/.test(nova) || !/[0-9]/.test(nova) || !/[!@#$%^&*(),.?":{}|<>_\-\\/\[\];'+=~`]/.test(nova)) {
            Alert.alert('Senha inválida', 'A nova senha deve ter 6+ caracteres, 1 maiúscula e 1 número.');
            return;
        }
        try {
            const cred = EmailAuthProvider.credential(user.email, atual);
            await reauthenticateWithCredential(user, cred);
            await updatePassword(user, nova);
            Alert.alert('Sucesso', 'Senha alterada com sucesso!');
        } catch {
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

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12, paddingTop: isDesktop ? 18 : 0 }}
            >
                <View style={{ width: '100%', maxWidth: 980, alignSelf: 'center' }}>

                <View style={[conteudoStyle.cardPerfil, isDesktop && { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }]}>
                    <View style={[conteudoStyle.avatarContainer, isDesktop && { marginBottom: 0, marginRight: 28, alignItems: 'center' }]}>
                        <Pressable style={conteudoStyle.avatar} onPress={handleUploadFoto}>
                            {usuario.fotoUrl
                                ? <Image source={{ uri: usuario.fotoUrl }} style={{ width: 70, height: 70, borderRadius: 35 }} />
                                : <MaterialCommunityIcons name="account-circle" size={60} color="#60519b" />
                            }
                        </Pressable>
                        <Text style={{ color: '#bfc0d1', fontSize: 12, marginTop: 6 }}>Toque para alterar foto</Text>
                    </View>

                    {!editando ? (
                        <View style={[conteudoStyle.secaoInfo, isDesktop && { alignItems: 'flex-start', flex: 1 }]}>
                            <Text style={[conteudoStyle.nomeUsuario, isDesktop && { textAlign: 'left', alignSelf: 'flex-start' }]}>{usuario.nome}</Text>
                            <Text style={[conteudoStyle.emailUsuario, isDesktop && { textAlign: 'left', alignSelf: 'flex-start' }]}>{usuario.email}</Text>
                            {usuario.bio
                                ? <Text style={[conteudoStyle.bioUsuario, isDesktop && { textAlign: 'left', alignSelf: 'flex-start' }]}>{usuario.bio}</Text>
                                : <Text style={[{ color: '#666', fontSize: 12, fontStyle: 'italic' }, isDesktop && { textAlign: 'left', alignSelf: 'flex-start' }]}>Sem bio cadastrada.</Text>
                            }
                            <Pressable style={[conteudoStyle.botaoEditar, { marginTop: 12 }, isDesktop && { alignSelf: 'flex-start' }]} onPress={() => setEditando(true)}>
                                <Text style={conteudoStyle.textoBotaoEditar}>✏️ Editar Perfil</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={[conteudoStyle.secaoInfo, isDesktop && { alignItems: 'flex-start', flex: 1 }]}>
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
                            <View style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 8, marginBottom: 8, width: isDesktop ? '100%' : '80%' }}>
                                <Text style={{ color: '#888', fontSize: 11 }}>
                                    🔒 E-mail e dados críticos não podem ser alterados por aqui.
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8, width: isDesktop ? '100%' : '80%' }}>
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
                    <View style={[conteudoStyle.botaoAcao, { justifyContent: 'space-between' }]}>
                        <Text style={conteudoStyle.textoBotaoAcao}>Notificações ativas</Text>
                        <Switch value={notificacaoAtiva} onValueChange={setNotificacaoAtiva} />
                    </View>
                    <View style={[conteudoStyle.botaoAcao, { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
                        <Text style={conteudoStyle.textoBotaoAcao}>Canal de notificação</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {(['email', 'push'] as const).map((canal) => (
                                <Pressable key={canal} onPress={() => setCanalNotificacao(canal)} style={[conteudoStyle.botaoEditar, { paddingHorizontal: 12, backgroundColor: canalNotificacao === canal ? '#a855f7' : '#3a3a5c' }]}>
                                    <Text style={conteudoStyle.textoBotaoEditar}>{canal === 'email' ? 'E-mail' : 'Push'}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <View style={[conteudoStyle.botaoAcao, { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
                        <Text style={conteudoStyle.textoBotaoAcao}>Frequencia de notificacoes</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {(['diaria', 'semanal', 'mensal'] as const).map((f) => (
                                <Pressable key={f} onPress={() => setFrequenciaNotificacao(f)} style={[conteudoStyle.botaoEditar, { paddingHorizontal: 12, backgroundColor: frequenciaNotificacao === f ? '#a855f7' : '#3a3a5c' }]}>
                                    <Text style={conteudoStyle.textoBotaoEditar}>{f === 'diaria' ? 'Diaria' : f === 'semanal' ? 'Semanal' : 'Mensal'}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <Pressable style={conteudoStyle.botaoAcao} onPress={handleAlterarSenha}>
                        <MaterialCommunityIcons name="lock-reset" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Alterar Senha</Text>
                    </Pressable>
                    <Text style={{ color: '#888', fontSize: 11, marginTop: -6 }}>
                        {user?.providerData?.some((provider) => provider.providerId === 'google.com') ? 'Login com Google: a senha e gerenciada na sua conta Google.' : 'Regras de senha: 6+ caracteres, 1 maiuscula, 1 numero e 1 caractere especial.'}
                    </Text>

                    <Pressable style={conteudoStyle.botaoAcao} onPress={() => router.push('/settings/politica-privacidade')}>
                        <MaterialCommunityIcons name="shield-account" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Política de Privacidade (LGPD)</Text>
                    </Pressable>

                    <Pressable style={conteudoStyle.botaoAcao} onPress={() => router.push('/settings/termos-uso')}>
                        <MaterialCommunityIcons name="file-document-outline" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Termos de Uso</Text>
                    </Pressable>

                    <Pressable style={conteudoStyle.botaoAcao} onPress={() => router.push('/settings/fale-conosco')}>
                        <MaterialCommunityIcons name="message-text-outline" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Fale Conosco</Text>
                    </Pressable>

                    <Pressable style={conteudoStyle.botaoAcao} onPress={() => router.push('/settings/sobre')}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Sobre o Aplicativo</Text>
                    </Pressable>

                    <Pressable style={conteudoStyle.botaoAcao} onPress={() => router.push('/settings/avaliacao')}>
                        <MaterialCommunityIcons name="star-outline" size={20} color="#a855f7" />
                        <Text style={conteudoStyle.textoBotaoAcao}>Avaliar o App</Text>
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
                </View>
            </ScrollView>
        </View>
    );
}



