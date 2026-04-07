import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';
import {
    deselectObject,
    GAME_CONFIG,
    GameState,
    getCharacterDirection,
    initializeGameState,
    selectObject,
    setCharacterTarget,
    updateGameState,
} from '../services/gameEngine';

export default function GameScreen() {
    const { width, height } = useWindowDimensions();
    const isDesktop = width > 768;
    const router = useRouter();
    const canvasRef = useRef<View>(null);

    // Calcular tamanho do canvas baseado na tela disponível
    const canvasWidth = Math.min(width - (isDesktop ? 130 : 30), 600);
    const canvasHeight = Math.min(height - (isDesktop ? 100 : 380), 400);

    // Estado do jogo
    const [gameState, setGameState] = useState<GameState>(() =>
        initializeGameState(canvasWidth, canvasHeight)
    );

    // Referência para o loop de animação
    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Loop de atualização do jogo
    useEffect(() => {
        gameLoopRef.current = setInterval(() => {
            setGameState((prevState) => updateGameState(prevState, 16));
        }, 16);

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, []);

    // Atualizar tamanho da sala quando a tela redimensiona
    useEffect(() => {
        setGameState((prevState) =>
            initializeGameState(canvasWidth, canvasHeight)
        );
    }, [canvasWidth, canvasHeight]);

    // Manipular clique/toque no chão (compatível com Web e Mobile)
    const handleFloorPress = (event: any) => {
        let locationX = 0;
        let locationY = 0;

        // Para Mobile (React Native)
        if (event.nativeEvent.locationX !== undefined) {
            locationX = event.nativeEvent.locationX;
            locationY = event.nativeEvent.locationY;
        }
        // Para Web (React)
        else if (event.nativeEvent.offsetX !== undefined) {
            locationX = event.nativeEvent.offsetX;
            locationY = event.nativeEvent.offsetY;
        }
        // Fallback para coordenadas relativas
        else if (canvasRef.current && event.nativeEvent.clientX !== undefined) {
            const rect = (canvasRef.current as any).getBoundingClientRect?.();
            if (rect) {
                locationX = event.nativeEvent.clientX - rect.left;
                locationY = event.nativeEvent.clientY - rect.top;
            }
        }

        const targetX = locationX - GAME_CONFIG.CHARACTER_WIDTH / 2;
        const targetY = locationY - GAME_CONFIG.CHARACTER_HEIGHT / 2;

        setGameState((prevState) => ({
            ...prevState,
            character: setCharacterTarget(
                prevState.character,
                targetX,
                targetY,
                canvasWidth,
                canvasHeight
            ),
        }));
    };

    // Manipular clique em objeto
    const handleObjectPress = (objectId: string) => {
        setGameState((prevState) => selectObject(prevState, objectId));
    };

    // Manipular ações com objeto selecionado
    const handleCustomizeObject = () => {
        const selected = gameState.selectedObject;
        if (selected) {
            Alert.alert(
                `Personalizar ${selected.name}`,
                `Você quer personalizar o(a) ${selected.name}?`,
                [
                    { text: 'Cancelar', onPress: () => { } },
                    {
                        text: 'Personalizar',
                        onPress: () => {
                            Alert.alert('Em Breve', 'Tela de personalização em desenvolvimento');
                        },
                    },
                ]
            );
        }
    };

    const handleUseObject = () => {
        const selected = gameState.selectedObject;
        if (selected) {
            Alert.alert(
                `Usar ${selected.name}`,
                `Você quer usar o(a) ${selected.name}?`,
                [
                    { text: 'Cancelar', onPress: () => { } },
                    {
                        text: 'Usar',
                        onPress: () => {
                            Alert.alert('Sucesso', `Você usou o(a) ${selected.name}`);
                        },
                    },
                ]
            );
        }
    };

    const handleCloseSelection = () => {
        setGameState((prevState) => deselectObject(prevState));
    };

    const handleGoBack = () => {
        router.push('/(tabs)/home');
    };

    const characterDirection = getCharacterDirection(gameState.character);
    const selectedObject = gameState.selectedObject;

    return (
        <View
            style={[
                mascara.container,
                {
                    flex: 1,
                    paddingLeft: isDesktop ? 90 : 0,
                }
            ]}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: isDesktop ? 20 : 160,
                    paddingHorizontal: isDesktop ? 20 : 10,
                    paddingTop: isDesktop ? 20 : 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                scrollEnabled={true}
            >
                {/* TÍTULO */}
                <Text style={conteudoStyle.titulo}>Seu Quarto</Text>

                {/* CANVAS DO JOGO */}
                <Pressable
                    ref={canvasRef}
                    style={[
                        conteudoStyle.gameCanvas,
                        {
                            width: canvasWidth,
                            height: canvasHeight,
                            marginTop: 10,
                            marginBottom: 15,
                        }
                    ]}
                    onPress={handleFloorPress}
                >
                    {/* OBJETOS DO JOGO */}
                    {gameState.gameObjects.map((obj) => (
                        <Pressable
                            key={obj.id}
                            style={[
                                conteudoStyle.gameObject,
                                {
                                    left: obj.position.x,
                                    top: obj.position.y,
                                    width: obj.width,
                                    height: obj.height,
                                    borderWidth: obj.isSelected ? 3 : 1,
                                    borderColor: obj.isSelected ? '#836fd1' : '#2e354d',
                                }
                            ]}
                            onPress={() => handleObjectPress(obj.id)}
                        >
                            <MaterialCommunityIcons
                                name={obj.icon as any}
                                size={32}
                                color={obj.isSelected ? '#836fd1' : '#60519b'}
                            />
                            <Text style={conteudoStyle.gameObjectLabel}>{obj.name}</Text>
                        </Pressable>
                    ))}

                    {/* PERSONAGEM */}
                    <View
                        style={[
                            conteudoStyle.character,
                            {
                                left: gameState.character.position.x,
                                top: gameState.character.position.y,
                                width: gameState.character.width,
                                height: gameState.character.height,
                            }
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={
                                characterDirection === 'up'
                                    ? 'arrow-up-circle'
                                    : characterDirection === 'down'
                                        ? 'arrow-down-circle'
                                        : characterDirection === 'left'
                                            ? 'arrow-left-circle'
                                            : characterDirection === 'right'
                                                ? 'arrow-right-circle'
                                                : 'account-circle'
                            }
                            size={40}
                            color="#60519b"
                        />
                    </View>
                </Pressable>

                {/* PAINEL DE INFORMAÇÕES E CONTROLES */}
                {selectedObject !== null ? (
                    <View style={[conteudoStyle.gameInfoPanel, { width: canvasWidth, marginHorizontal: 10 }]}>
                        <View style={conteudoStyle.objectSelectionPanel}>
                            <View style={conteudoStyle.objectSelectionHeader}>
                                <MaterialCommunityIcons
                                    name={selectedObject.icon as any}
                                    size={32}
                                    color="#836fd1"
                                />
                                <Text style={conteudoStyle.objectSelectionTitle}>
                                    {selectedObject.name}
                                </Text>
                                <Pressable onPress={handleCloseSelection}>
                                    <MaterialCommunityIcons name="close" size={24} color="#bfc0d1" />
                                </Pressable>
                            </View>

                            <Text style={conteudoStyle.objectSelectionType}>
                                Tipo: {selectedObject.type === 'furniture' ? 'Móvel' : 'Decoração'}
                            </Text>

                            <View style={conteudoStyle.objectActionButtons}>
                                <Pressable
                                    style={[conteudoStyle.botao, conteudoStyle.botaoCustomize]}
                                    onPress={handleCustomizeObject}
                                >
                                    <MaterialCommunityIcons name="palette" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={conteudoStyle.textoBotao}>Personalizar</Text>
                                </Pressable>

                                <Pressable
                                    style={[conteudoStyle.botao, conteudoStyle.botaoUse]}
                                    onPress={handleUseObject}
                                >
                                    <MaterialCommunityIcons name="check" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={conteudoStyle.textoBotao}>Usar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={[conteudoStyle.gameInfoPanel, { width: canvasWidth, marginHorizontal: 10 }]}>
                        <View style={conteudoStyle.gameStatusPanel}>
                            <Text style={conteudoStyle.gameStatusText}>
                                Toque em um objeto para interagir ou clique no chão para mover o personagem
                            </Text>
                            <Pressable
                                style={[conteudoStyle.botao, { marginTop: 10 }]}
                                onPress={handleGoBack}
                            >
                                <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={conteudoStyle.textoBotao}>Voltar</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
