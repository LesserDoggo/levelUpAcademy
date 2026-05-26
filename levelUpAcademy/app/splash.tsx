import SplashLogo from '@/components/SplashLogo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import mascara from './css/style';


export default function Splash() {

    const router = useRouter();
    const { user, carregando } = useAuth();

    useEffect(() => {
        if (carregando) return;

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
    }, [carregando, router, user]);

    return (
        <View style={mascara.container}>
            <Image
                source={require("../assets/images/background_placeholder.png")}
                style={mascara.imgFundo}
            />
            <View style={{ alignItems: "center", alignContent: 'center', justifyContent: 'center', flex: 1 }}>
                <View style={mascara.logoFrame}>
                    <SplashLogo />
                </View>
            </View>
        </View>
    )
}
