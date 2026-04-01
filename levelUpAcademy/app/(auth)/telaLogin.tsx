import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, TextInput, View } from 'react-native';
import mascara from '../css/style';

//import { GoogleSignIn } from '@react-native-google-signin/google-signin';

/*GoogleSignIn.configure({
  webClientId: '467146769778-41m3b6jkaomriudfncb9366mhp25kqn4.apps.googleusercontent.com',
})*/

export default function TelaLogin() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true
        }).start();
    }, []);

    const [email, setEmail] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    function Entrar() {
        if (email == 'aluno@aluno' && senha == '123') {
            router.replace('../(tabs)/home');
        } else {
            alert('Acesso negado');
        }
    }
    return (
        <View style={mascara.container}>
            <Image
                source={require("../../assets/images/background_placeholder.png")}
                style={mascara.imgFundo}
            />
            <Animated.View style={[mascara.cxLogin, { opacity: fadeAnim }]}>
                <View style={mascara.cxTituloLogin}>
                    <Text style={mascara.paragraph}>Escolha sua opção de login</Text>
                </View>
                <View style={mascara.cxInput}>
                    <TextInput placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} placeholderTextColor="#bfc0d1" style={mascara.inputTexto} />
                    <TextInput placeholder="Digite sua senha" value={senha} onChangeText={setSenha} placeholderTextColor="#bfc0d1" style={mascara.inputTexto} />
                    <Pressable style={({ pressed }) => [mascara.botao, pressed && mascara.botaoPressionado]} onPress={Entrar}>
                        <Text style={mascara.textoBotao}>Entrar</Text>
                    </Pressable>
                    <Pressable style={({ pressed }) => [mascara.botao, pressed && mascara.botaoPressionado]} onPress={() => router.replace('../(tabs)/home')}>
                        <Text style={mascara.textoBotao}>Home</Text>
                    </Pressable>
                </View>
            </Animated.View >
        </View >
    )
}