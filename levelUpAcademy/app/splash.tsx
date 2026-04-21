import { useRouter } from 'expo-router';
import LottieView from "lottie-react-native";
import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import mascara from './css/style';


export default function Splash() {

    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        async function Prepare() {
            try {
                await new Promise(tempo => setTimeout(tempo, 4000))
            } catch (e) {
                alert(e);
            } finally {
                router.replace(user ? '/(tabs)/home' : '/(auth)/telaLogin');
            }
        }

        Prepare();
    }, [router, user]);

    return (
        <View style={mascara.container}>
            <Image
                source={require("../assets/images/background_placeholder.png")}
                style={mascara.imgFundo}
            />
            <LottieView
                source={require("../assets/images/logoPHolder.json")}
                autoPlay
                loop={false}
                style={mascara.logo}
            />
        </View>
    )
}
