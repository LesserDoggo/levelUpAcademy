import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
    GoogleAuthProvider,
    signInWithCredential
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import { auth, db } from '../config/firebaseConfig';
import mascara from '../css/style';
import { logarUsuario } from '../services/authService';

// IMPORTANTE: Necessário para o redirecionamento fechar a aba corretamente na Web
WebBrowser.maybeCompleteAuthSession();

export default function TelaLogin() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [carregandoGoogle, setCarregandoGoogle] = useState(false);
    const [erroEmail, setErroEmail] = useState('');
    const [erroSenha, setErroSenha] = useState('');

    // --- Google Sign-In ---
    const redirectUri = makeRedirectUri({
        scheme: 'levelupacademy',
        path: 'redirect',
    });

    const [request, response, promptAsync] = Google.useAuthRequest(
        {
            webClientId: '1057924564707-7iuconbv347v9e518u228pubg0nep6pb.apps.googleusercontent.com',
            iosClientId: 'com.googleusercontent.apps.1057924564707-nhf5ij99euca0fjf95j08ajpubhirk95',
            androidClientId: '1057924564707-nhf5ij99euca0fjf95j08ajpubhirk95.apps.googleusercontent.com',
            redirectUri,
        }
    );

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 750, useNativeDriver: true }).start();
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            // Na Web, o token pode vir em params.id_token ou params.authentication.idToken
            const { id_token, authentication } = response.params;

            // Correção do erro ts(2339): Usando uma verificação de tipo segura
            let token = id_token;

            if (!token && authentication && typeof authentication === 'object' && 'idToken' in authentication) {
                token = (authentication as any).idToken;
            }

            if (token) {
                handleGoogleCredential(token);
            } else {
                setCarregandoGoogle(false);
                console.error('Token não encontrado na resposta do Google:', response);
            }
        } else if (response?.type === 'error' || response?.type === 'cancel') {
            setCarregandoGoogle(false);
        }
    }, [response]);

    async function handleGoogleCredential(idToken: string) {
        try {
            setCarregandoGoogle(true);
            const credential = GoogleAuthProvider.credential(idToken);
            const { user } = await signInWithCredential(auth, credential);

            const ref = doc(db, 'usuarios', user.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                await setDoc(ref, {
                    uid: user.uid,
                    nome: user.displayName ?? 'Usuário',
                    email: user.email ?? '',
                    nivel: 1,
                    xpTotal: 0,
                    moedas: 100,
                    diasOfensiva: 0,
                    cursosCompletos: 0,
                    bio: '',
                    fotoUrl: user.photoURL ?? null,
                    criadoEm: serverTimestamp(),
                    ultimoLogin: serverTimestamp(),
                });
            } else {
                await setDoc(ref, { ultimoLogin: serverTimestamp() }, { merge: true });
            }

            router.replace('/(tabs)/home');
        } catch (e: any) {
            console.error('handleGoogleCredential error:', e);
            Alert.alert('Erro', 'Não foi possível finalizar o login com o Google: ' + e.message);
        } finally {
            setCarregandoGoogle(false);
        }
    }

    // —— Login e-mail/senha ——————————————————————————————————————————————————————
    function validar(): boolean {
        let ok = true;
        setErroEmail('');
        setErroSenha('');
        if (!email.trim()) { setErroEmail('Informe o e-mail.'); ok = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErroEmail('E-mail inválido.'); ok = false; }
        if (!senha) { setErroSenha('Informe a senha.'); ok = false; }
        return ok;
    }

    async function entrar() {
        if (!validar()) return;
        setCarregando(true);
        const resultado = await logarUsuario(email.trim(), senha);
        setCarregando(false);
        if (resultado.sucesso) {
            router.replace('/(tabs)/home');
        } else {
            Alert.alert('Erro ao entrar', resultado.mensagem);
        }
    }

    async function entrarComGoogle() {
        setCarregandoGoogle(true);
        await promptAsync();
    }

    return (
        <View style={mascara.container}>
            <Image
                source={require('../../assets/images/background_placeholder.png')}
                style={mascara.imgFundo}
            />

            <Animated.View style={[mascara.cxLogin, { opacity: fadeAnim }]}>
                <View style={mascara.cxTituloLogin}>
                    <Text style={mascara.paragraph}>Escolha sua opção de login</Text>
                </View>

                <View style={mascara.cxInput}>
                    {/* E-MAIL */}
                    <TextInput
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChangeText={(t) => { setEmail(t); setErroEmail(''); }}
                        placeholderTextColor="#bfc0d1"
                        style={mascara.inputTexto}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {erroEmail ? (
                        <Text style={{ color: '#ff4d4d', fontSize: 12, marginBottom: 4, width: '80%', alignSelf: 'center' }}>
                            {erroEmail}
                        </Text>
                    ) : null}

                    {/* SENHA */}
                    <TextInput
                        placeholder="Digite sua senha"
                        value={senha}
                        onChangeText={(t) => { setSenha(t); setErroSenha(''); }}
                        placeholderTextColor="#bfc0d1"
                        style={mascara.inputTexto}
                        secureTextEntry
                    />
                    {erroSenha ? (
                        <Text style={{ color: '#ff4d4d', fontSize: 12, marginBottom: 4, width: '80%', alignSelf: 'center' }}>
                            {erroSenha}
                        </Text>
                    ) : null}

                    {/* ENTRAR */}
                    <Pressable
                        style={({ pressed }) => [mascara.botao, pressed && mascara.botaoPressionado]}
                        onPress={entrar}
                        disabled={carregando || carregandoGoogle}
                    >
                        {carregando
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={mascara.textoBotao}>Entrar</Text>
                        }
                    </Pressable>

                    {/* Esqueceu a senha */}
                    <Pressable onPress={() => router.push('/(auth)/telaRecuperacao')}>
                        <Text style={{ color: '#bfc0d1', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
                            Esqueceu a senha?
                        </Text>
                    </Pressable>

                    {/* Divisor */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#3a3a5c' }} />
                        <Text style={{ color: '#bfc0d1', marginHorizontal: 8, fontSize: 12 }}>ou</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#3a3a5c' }} />
                    </View>

                    {/* GOOGLE */}
                    <Pressable
                        style={({ pressed }) => [
                            mascara.botao,
                            pressed && mascara.botaoPressionado,
                            { backgroundColor: '#ffffff18', borderColor: '#4285F4' },
                            (!request || carregandoGoogle) && { opacity: 0.6 },
                        ]}
                        onPress={entrarComGoogle}
                        disabled={!request || carregandoGoogle || carregando}
                    >
                        {carregandoGoogle
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={mascara.textoBotao}>Continuar com Google</Text>
                        }
                    </Pressable>
                </View>

                <Pressable style={{ marginTop: 20 }} onPress={() => router.push('/(auth)/telaCadastro')}>
                    <Text style={{ color: '#bfc0d1', textAlign: 'center', fontSize: 14 }}>
                        Não tem uma conta? <Text style={{ color: '#6a11cb', fontWeight: 'bold' }}>Cadastre-se</Text>
                    </Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}
