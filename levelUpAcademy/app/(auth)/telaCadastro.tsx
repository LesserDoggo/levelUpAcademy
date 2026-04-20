// =============================================================================
// LEVELUP ACADEMY — app/(auth)/telaCadastro.tsx
// CORREÇÃO #1: CampoInput extraído FORA do componente principal.
// Componentes definidos dentro do render são recriados a cada keystroke,
// causando perda de foco e dispensando o teclado.
// =============================================================================

import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import mascara from '../css/style';
import { cadastrarUsuario } from '../services/authService';

function validarForcaSenha(senha: string): string | null {
    if (senha.length < 6) return 'Mínimo de 6 caracteres.';
    if (!/[A-Z]/.test(senha)) return 'Inclua ao menos uma letra maiúscula.';
    if (!/[0-9]/.test(senha)) return 'Inclua ao menos um número.';
    return null;
}

// ── CampoInput definido FORA do TelaCadastro ────────────────────────────────
interface CampoProps {
    value: string;
    onChange: (t: string) => void;
    placeholder: string;
    erro?: string;
    secure?: boolean;
    keyboard?: 'default' | 'email-address';
    autoCapitalize?: 'none' | 'words' | 'sentences';
}

function CampoInput({
    value,
    onChange,
    placeholder,
    erro,
    secure = false,
    keyboard = 'default',
    autoCapitalize = 'sentences',
}: CampoProps) {
    return (
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 4 }}>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                placeholderTextColor="#bfc0d1"
                style={[mascara.inputTexto, erro ? { borderColor: '#ff4d4d', borderWidth: 1.5 } : {}]}
                secureTextEntry={secure}
                keyboardType={keyboard}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
            />
            {erro ? (
                <Text style={{ color: '#ff4d4d', fontSize: 12, marginBottom: 2, alignSelf: 'flex-start', marginLeft: '10%' }}>
                    {erro}
                </Text>
            ) : null}
        </View>
    );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function TelaCadastro() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [aceitouTermos, setAceitouTermos] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 750, useNativeDriver: true }).start();
    }, [fadeAnim]);

    function limparErro(campo: string) {
        setErros((e) => ({ ...e, [campo]: '' }));
    }

    function validar(): boolean {
        const novos: Record<string, string> = {};
        if (!nome.trim()) novos.nome = 'Informe seu nome.';
        if (!email.trim()) novos.email = 'Informe o e-mail.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) novos.email = 'E-mail inválido.';
        const erroSenha = validarForcaSenha(senha);
        if (erroSenha) novos.senha = erroSenha;
        if (senha !== confirmar) novos.confirmar = 'As senhas não coincidem.';
        if (!aceitouTermos) novos.termos = 'Aceite os Termos de Uso para continuar.';
        setErros(novos);
        return Object.keys(novos).length === 0;
    }

    async function registrar() {
        if (!validar()) return;
        setCarregando(true);
        const resultado = await cadastrarUsuario(nome.trim(), email.trim(), senha);
        setCarregando(false);
        if (resultado.sucesso) {
            Alert.alert('🎉 Conta criada!', 'Bem-vindo ao LevelUp Academy!', [
                { text: 'Começar', onPress: () => router.replace('/(tabs)/home') },
            ]);
        } else {
            Alert.alert('Erro ao cadastrar', resultado.mensagem);
        }
    }

    return (
        <View style={mascara.container}>
            <Image source={require('../../assets/images/background_placeholder.png')} style={mascara.imgFundo} />

            <Animated.View style={[mascara.cxLogin, { opacity: fadeAnim }]}>
                {/* keyboardShouldPersistTaps evita que toque fora do input dispense o teclado */}
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={mascara.cxTituloLogin}>
                        <Text style={mascara.paragraph}>Criar Conta</Text>
                    </View>

                    <View style={mascara.cxInput}>
                        <CampoInput
                            value={nome}
                            onChange={(t) => { setNome(t); limparErro('nome'); }}
                            placeholder="Seu nome completo"
                            erro={erros.nome}
                            autoCapitalize="words"
                        />
                        <CampoInput
                            value={email}
                            onChange={(t) => { setEmail(t); limparErro('email'); }}
                            placeholder="Digite seu e-mail"
                            erro={erros.email}
                            keyboard="email-address"
                            autoCapitalize="none"
                        />
                        <CampoInput
                            value={senha}
                            onChange={(t) => { setSenha(t); limparErro('senha'); }}
                            placeholder="Crie uma senha"
                            erro={erros.senha}
                            secure
                            autoCapitalize="none"
                        />
                        <CampoInput
                            value={confirmar}
                            onChange={(t) => { setConfirmar(t); limparErro('confirmar'); }}
                            placeholder="Confirme sua senha"
                            erro={erros.confirmar}
                            secure
                            autoCapitalize="none"
                        />

                        {/* Política de senha */}
                        <View style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 10, marginBottom: 12, width: '80%', alignSelf: 'center' }}>
                            <Text style={{ color: '#bfc0d1', fontSize: 11, lineHeight: 18 }}>
                                🔐 Política de senha:{'\n'}
                                {'  '}• Mínimo de 6 caracteres{'\n'}
                                {'  '}• Ao menos 1 letra maiúscula{'\n'}
                                {'  '}• Ao menos 1 número
                            </Text>
                        </View>

                        {/* Aceite LGPD */}
                        <Pressable
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, width: '80%', alignSelf: 'center' }}
                            onPress={() => { setAceitouTermos(!aceitouTermos); limparErro('termos'); }}
                        >
                            <View style={{
                                width: 20, height: 20, borderRadius: 4, borderWidth: 1, flexShrink: 0,
                                borderColor: aceitouTermos ? '#a855f7' : '#bfc0d1',
                                backgroundColor: aceitouTermos ? '#a855f7' : 'transparent',
                                marginRight: 8, alignItems: 'center', justifyContent: 'center',
                            }}>
                                {aceitouTermos && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                            </View>
                            <Text style={{ color: '#bfc0d1', fontSize: 12, flex: 1 }}>
                                Li e aceito os <Text style={{ color: '#a855f7' }}>Termos de Uso</Text> e a{' '}
                                <Text style={{ color: '#a855f7' }}>Política de Privacidade</Text> (LGPD).
                            </Text>
                        </Pressable>
                        {erros.termos ? (
                            <Text style={{ color: '#ff4d4d', fontSize: 12, marginBottom: 8, width: '80%', alignSelf: 'center' }}>
                                {erros.termos}
                            </Text>
                        ) : null}

                        <Pressable
                            style={({ pressed }) => [mascara.botao, pressed && mascara.botaoPressionado]}
                            onPress={registrar}
                            disabled={carregando}
                        >
                            {carregando ? <ActivityIndicator color="#fff" /> : <Text style={mascara.textoBotao}>Criar Conta</Text>}
                        </Pressable>

                        <Pressable onPress={() => router.back()}>
                            <Text style={{ color: '#bfc0d1', textAlign: 'center', marginTop: 16, fontSize: 13 }}>
                                Já tem uma conta?{' '}
                                <Text style={{ color: '#a855f7', fontWeight: 'bold' }}>Entrar</Text>
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
}
