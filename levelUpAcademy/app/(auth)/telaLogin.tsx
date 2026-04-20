import { useRouter } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Platform,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import Constants from 'expo-constants';
import mascara from '../css/style';
import { useAuth } from '../context/AuthContext';
import { concluirLoginComGoogleWeb, iniciarLoginComGoogleWeb } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();

export default function TelaLogin() {
    const webClientId =
        Constants.expoConfig?.extra?.googleWebClientId ??
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
        '1057924564707-7iuconbv347v9e518u228pubg0nep6pb.apps.googleusercontent.com';

    const iosClientId =
        Constants.expoConfig?.extra?.googleIosClientId ??
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
        '1057924564707-nhf5ij99euca0fjf95j08ajpubhirk95.apps.googleusercontent.com';

    const androidClientId =
        Constants.expoConfig?.extra?.googleAndroidClientId ??
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ??
        '1057924564707-nhf5ij99euca0fjf95j08ajpubhirk95.apps.googleusercontent.com';

    const router = useRouter();
    const { login, loginComGoogle } = useAuth();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [carregandoGoogle, setCarregandoGoogle] = useState(false);
    const [erroEmail, setErroEmail] = useState('');
    const [erroSenha, setErroSenha] = useState('');
    const [erroAuth, setErroAuth] = useState('');

    const redirectUri = makeRedirectUri({
        scheme: 'levelupacademy',
        path: 'redirect',
    });

    const [, response, promptAsync] = Google.useAuthRequest({
        webClientId,
        iosClientId,
        androidClientId,
        redirectUri,
        responseType: 'id_token',
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 750, useNativeDriver: true }).start();
    }, [fadeAnim]);

    function exibirErro(titulo: string, mensagem: string) {
        setErroAuth(mensagem);

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.alert(`${titulo}\n\n${mensagem}`);
            return;
        }

        Alert.alert(titulo, mensagem);
    }

    useEffect(() => {
        async function processarRedirectGoogleWeb() {
            if (Platform.OS !== 'web') return;

            try {
                setCarregandoGoogle(true);
                setErroAuth('');

                const resultado = await concluirLoginComGoogleWeb();

                if (!resultado) {
                    return;
                }

                if (!resultado.sucesso) {
                    exibirErro('Erro', resultado.mensagem);
                    return;
                }

                router.replace('/(tabs)/home');
            } catch (erro: any) {
                exibirErro('Erro', erro?.message ?? 'Nao foi possivel concluir o login com Google.');
            } finally {
                setCarregandoGoogle(false);
            }
        }

        processarRedirectGoogleWeb();
    }, [router]);

    useEffect(() => {
        async function processarGoogleResponse() {
            if (Platform.OS === 'web') return;
            if (response && response.type !== 'success') {
                setCarregandoGoogle(false);
                return;
            }
            if (response?.type !== 'success') return;

            try {
                setCarregandoGoogle(true);
                setErroAuth('');

                const idToken =
                    response.authentication?.idToken ??
                    (typeof response.params?.id_token === 'string' ? response.params.id_token : undefined);

                const resultado = await loginComGoogle(idToken);
                if (!resultado.sucesso) {
                    exibirErro('Erro', resultado.mensagem);
                    return;
                }

                router.replace('/(tabs)/home');
            } catch (erro: any) {
                exibirErro('Erro', erro?.message ?? 'Nao foi possivel entrar com Google.');
            } finally {
                setCarregandoGoogle(false);
            }
        }

        processarGoogleResponse();
    }, [response, loginComGoogle, router]);

    function validar(): boolean {
        let ok = true;
        setErroEmail('');
        setErroSenha('');

        if (!email.trim()) {
            setErroEmail('Informe o e-mail.');
            ok = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErroEmail('E-mail invalido.');
            ok = false;
        }

        if (!senha) {
            setErroSenha('Informe a senha.');
            ok = false;
        }

        return ok;
    }

    async function entrar() {
        if (!validar()) return;

        setErroAuth('');
        setCarregando(true);

        const resultado = await login(email.trim(), senha);

        setCarregando(false);

        if (resultado.sucesso) {
            router.replace('/(tabs)/home');
        } else {
            exibirErro('Erro ao entrar', resultado.mensagem);
        }
    }

    async function entrarComGoogle() {
        try {
            setErroAuth('');
            setCarregandoGoogle(true);

            if (Platform.OS === 'web') {
                const resultado = await iniciarLoginComGoogleWeb();

                if (resultado?.sucesso) {
                    router.replace('/(tabs)/home');
                }

                return;
            }

            if (!webClientId) {
                exibirErro('Configuracao ausente', 'Google Login nao configurado: webClientId ausente.');
                return;
            }

            const resultadoPrompt = await promptAsync();
            if (resultadoPrompt.type !== 'success') {
                setCarregandoGoogle(false);
            }
        } catch (erro: any) {
            exibirErro('Erro', erro?.message ?? 'Nao foi possivel entrar com Google.');
        } finally {
            if (Platform.OS === 'web') {
                setCarregandoGoogle(false);
            }
        }
    }

    return (
        <View style={mascara.container}>
            <Image
                source={require('../../assets/images/background_placeholder.png')}
                style={mascara.imgFundo}
            />

            <Animated.View style={[mascara.cxLogin, { opacity: fadeAnim }]}>
                <View style={mascara.cxTituloLogin}>
                    <Text style={mascara.paragraph}>Escolha sua opcao de login</Text>
                </View>

                <View style={mascara.cxInput}>
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

                    <Pressable
                        style={({ pressed }) => [mascara.botao, pressed && mascara.botaoPressionado]}
                        onPress={entrar}
                        disabled={carregando || carregandoGoogle}
                    >
                        {carregando
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={mascara.textoBotao}>Entrar</Text>}
                    </Pressable>

                    <Pressable onPress={() => router.push('/(auth)/telaRecuperacao')}>
                        <Text style={{ color: '#bfc0d1', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
                            Esqueceu a senha?
                        </Text>
                    </Pressable>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#3a3a5c' }} />
                        <Text style={{ color: '#bfc0d1', marginHorizontal: 8, fontSize: 12 }}>ou</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#3a3a5c' }} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            mascara.botao,
                            pressed && mascara.botaoPressionado,
                            { backgroundColor: '#ffffff18', borderColor: '#4285F4' },
                            carregandoGoogle && { opacity: 0.6 },
                        ]}
                        onPress={entrarComGoogle}
                        disabled={carregandoGoogle || carregando}
                    >
                        {carregandoGoogle
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={mascara.textoBotao}>Continuar com Google</Text>}
                    </Pressable>

                    {erroAuth ? (
                        <Text style={{ color: '#ff8585', fontSize: 12, marginTop: 8, width: '80%', alignSelf: 'center', textAlign: 'center' }}>
                            {erroAuth}
                        </Text>
                    ) : null}
                </View>

                <Pressable style={{ marginTop: 20 }} onPress={() => router.push('/(auth)/telaCadastro')}>
                    <Text style={{ color: '#bfc0d1', textAlign: 'center', fontSize: 14 }}>
                        Nao tem uma conta? <Text style={{ color: '#6a11cb', fontWeight: 'bold' }}>Cadastre-se</Text>
                    </Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}
