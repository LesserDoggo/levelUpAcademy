// =============================================================================
// LEVELUP ACADEMY — app/(auth)/telaRecuperacao.tsx
// Tela de Recuperação de Senha via Firebase (e-mail)
// =============================================================================

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import mascara from '../css/style';
import { recuperarSenha } from '../services/authService';

export default function TelaRecuperacao() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [erroEmail, setErroEmail] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    async function enviar() {
        setErroEmail('');
        setMensagemSucesso('');

        if (!email.trim()) {
            setErroEmail('Informe o e-mail.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErroEmail('E-mail inválido.');
            return;
        }

        setCarregando(true);
        // Por segurança, exibe mensagem de sucesso mesmo se o e-mail não existir
        await recuperarSenha(email.trim());
        setCarregando(false);
        setEnviado(true);
        setMensagemSucesso(
            'Se este e-mail estiver cadastrado, você receberá as instruções de recuperação em breve.'
        );
    }

    return (
        <View style={mascara.container}>
            <Image
                source={require('../../assets/images/background_placeholder.png')}
                style={mascara.imgFundo}
            />

            <View style={mascara.cxLogin}>
                <View style={mascara.cxTituloLogin}>
                    <Text style={mascara.paragraph}>Recuperar Senha</Text>
                </View>

                <View style={mascara.cxInput}>
                    {!enviado ? (
                        <>
                            <Text style={{ color: '#bfc0d1', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                                Informe seu e-mail cadastrado. Enviaremos um link para redefinir sua senha.
                            </Text>

                            <TextInput
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChangeText={(t) => { setEmail(t); setErroEmail(''); }}
                                placeholderTextColor="#bfc0d1"
                                style={mascara.inputTexto}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {erroEmail ? (
                                <Text style={{ color: '#ff4d4d', fontSize: 12, marginBottom: 8 }}>{erroEmail}</Text>
                            ) : null}

                            <Pressable
                                style={({ pressed }) => [mascara.botao, pressed && mascara.botaoPressionado]}
                                onPress={enviar}
                                disabled={carregando}
                            >
                                {carregando ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={mascara.textoBotao}>Enviar Link</Text>
                                )}
                            </Pressable>
                        </>
                    ) : (
                        <>
                            {/* Feedback de sucesso (mesmo se e-mail não existir — segurança contra enumeração) */}
                            <View style={{
                                backgroundColor: '#1a2e1a',
                                borderRadius: 8,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#2d7a2d',
                                marginBottom: 20,
                            }}>
                                <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>📧</Text>
                                <Text style={{ color: '#6fcf6f', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                                    {mensagemSucesso}
                                </Text>
                            </View>

                            <Text style={{ color: '#bfc0d1', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                                Verifique também a pasta de spam.
                            </Text>
                        </>
                    )}

                    {/* BOTÃO VOLTAR */}
                    <Pressable onPress={() => router.back()}>
                        <Text style={{ color: '#a855f7', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
                            ← Voltar para o Login
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
