import { menuStyle } from '@/app/css/menustyle';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mascara from '../app/css/style';

export default function MenuInf() {
    const router = useRouter();
    const { height, width } = useWindowDimensions();
    const isDesktop = width > 768;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fixNavbar = async () => {
            await NavigationBar.setVisibilityAsync('hidden');
            await NavigationBar.setPositionAsync('absolute');
        };

        fixNavbar();

        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                fixNavbar();
            }
        });

        return () => sub.remove();
    }, []);

    return (
        <View
            style={[
                menuStyle(isDesktop, height),
                !isDesktop && {
                    bottom: 0,
                    paddingBottom: 10 + insets.bottom,
                },
            ]}
        >
            <Pressable style={({ pressed }) => [mascara.abaMenu, pressed && mascara.abaPressionada]}
                onPress={() => router.replace('/(tabs)/home')}
            >
                <AntDesign name="home" size={26} color="#7061ab" />
            </Pressable>

            <Pressable style={({ pressed }) => [mascara.abaMenu, pressed && mascara.abaPressionada]}
                onPress={() => router.replace('/(tabs)/cursos')}
            >
                <AntDesign name="book" size={26} color="#7061ab" />
            </Pressable>

            <Pressable style={({ pressed }) => [mascara.abaMenu, pressed && mascara.abaPressionada]}
                onPress={() => router.replace('/(tabs)/gameScreen')}
            >
                <MaterialCommunityIcons name="gamepad-variant-outline" size={26} color="#7061ab" />
            </Pressable>

            <Pressable style={({ pressed }) => [mascara.abaMenu, pressed && mascara.abaPressionada]}>
                <MaterialCommunityIcons name="gift-outline" size={26} color="#7061ab" />
            </Pressable>

            <Pressable style={({ pressed }) => [mascara.abaMenu, pressed && mascara.abaPressionada]}>
                <MaterialCommunityIcons name="account-outline" size={26} color="#7061ab" />
            </Pressable>
        </View>
    );
}