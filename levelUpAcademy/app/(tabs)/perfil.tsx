import MenuInf from '@/components/Menu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

interface UsuarioDados {
    nome: string;
    email: string;
    nivel: number;
    xpTotal: number;
    moedas: number;
    diasOfensiva: number;
    cursosCompletos: number;
    bio: string;
}

const usuarioMock: UsuarioDados = {
    nome: 'Teste',
    email: 'teste@email.com',
    nivel: 2,
    xpTotal: 150,
    moedas: 500,
    diasOfensiva: 3,
    cursosCompletos: 1,
    bio: 'Teste de descricao',
};

export default function Perfil() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const router = useRouter();

    const [usuario, setUsuario] = useState<UsuarioDados>(usuarioMock);
    const [editando, setEditando] = useState(false);
    const [nomeEdit, setNomeEdit] = useState(usuario.nome);
    const [bioEdit, setBioEdit] = useState(usuario.bio);

    const handleSalvar = () => {
        setUsuario({
            ...usuario,
            nome: nomeEdit,
            bio: bioEdit,
        });
        setEditando(false);
    };

    const handleCancelar = () => {
        setNomeEdit(usuario.nome);
        setBioEdit(usuario.bio);
        setEditando(false);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Deseja sair da sua conta?', [
            { text: 'Cancelar', onPress: () => { } },
            {
                text: 'Sair',
                onPress: () => {
                    router.replace('/(auth)/telaLogin');
                },
            },
        ]);
    };

    return (
        <View
            style={[
                mascara.container,
                {
                    flex: 1,
                    paddingBottom: isDesktop ? 0 : 130,
                    paddingLeft: isDesktop ? 90 : 0,
                    paddingTop: isDesktop ? 0 : 30,
                }
            ]}
        >
            <MenuInf />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* CARD DE PERFIL */}
                <View style={conteudoStyle.cardPerfil}>
                    {/* AVATAR */}
                    <View style={conteudoStyle.avatarContainer}>
                        <View style={conteudoStyle.avatar}>
                            <MaterialCommunityIcons name="account-circle" size={60} color="#60519b" />
                        </View>
                    </View>

                    {/* SEÇÃO DE INFORMAÇÕES OU EDIÇÃO */}
                    {!editando ? (
                        <View style={conteudoStyle.secaoInfo}>
                            <Text style={conteudoStyle.nomePerfil}>{usuario.nome}</Text>
                            <Text style={conteudoStyle.emailPerfil}>{usuario.email}</Text>
                            <Text style={conteudoStyle.bioPerfil}>{usuario.bio}</Text>

                            <Pressable
                                style={[conteudoStyle.botao, { marginTop: 15 }]}
                                onPress={() => setEditando(true)}
                            >
                                <MaterialCommunityIcons name="pencil" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={conteudoStyle.textoBotao}>Editar Perfil</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={conteudoStyle.secaoEdicao}>
                            <Text style={[conteudoStyle.nomePerfil, { marginBottom: 15 }]}>Editar Perfil</Text>

                            <Text style={conteudoStyle.labelInput}>Nome</Text>
                            <TextInput
                                style={conteudoStyle.inputPerfil}
                                value={nomeEdit}
                                onChangeText={setNomeEdit}
                                placeholderTextColor="#7061ab"
                            />

                            <Text style={conteudoStyle.labelInput}>Bio</Text>
                            <TextInput
                                style={[conteudoStyle.inputPerfil, { minHeight: 80, textAlignVertical: 'top' }]}
                                value={bioEdit}
                                onChangeText={setBioEdit}
                                multiline
                                placeholderTextColor="#7061ab"
                            />

                            <View style={conteudoStyle.botoesEdicao}>
                                <Pressable
                                    style={[conteudoStyle.botao, conteudoStyle.botaoSalvar, { flex: 1, marginHorizontal: 5 }]}
                                    onPress={handleSalvar}
                                >
                                    <MaterialCommunityIcons name="check" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={conteudoStyle.textoBotao}>Salvar</Text>
                                </Pressable>

                                <Pressable
                                    style={[conteudoStyle.botao, conteudoStyle.botaoCancelar, { flex: 1, marginHorizontal: 5 }]}
                                    onPress={handleCancelar}
                                >
                                    <MaterialCommunityIcons name="close" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={conteudoStyle.textoBotao}>Cancelar</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>

                {/* GRID DE ESTATÍSTICAS */}
                <View style={conteudoStyle.gridEstatisticas}>
                    <View style={conteudoStyle.cardEstatistica}>
                        <MaterialCommunityIcons name="shield-sword" size={28} color="#ffd700" />
                        <Text style={conteudoStyle.numeroEstatistica}>{usuario.nivel}</Text>
                        <Text style={conteudoStyle.labelEstatistica}>Nível</Text>
                    </View>

                    <View style={conteudoStyle.cardEstatistica}>
                        <MaterialCommunityIcons name="diamond" size={28} color="#00d4ff" />
                        <Text style={conteudoStyle.numeroEstatistica}>{usuario.xpTotal}</Text>
                        <Text style={conteudoStyle.labelEstatistica}>XP Total</Text>
                    </View>

                    <View style={conteudoStyle.cardEstatistica}>
                        <MaterialCommunityIcons name="gold" size={28} color="#ffa500" />
                        <Text style={conteudoStyle.numeroEstatistica}>{usuario.moedas}</Text>
                        <Text style={conteudoStyle.labelEstatistica}>Moedas</Text>
                    </View>

                    <View style={conteudoStyle.cardEstatistica}>
                        <MaterialCommunityIcons name="fire" size={28} color="#ff6b35" />
                        <Text style={conteudoStyle.numeroEstatistica}>{usuario.diasOfensiva}</Text>
                        <Text style={conteudoStyle.labelEstatistica}>Dias</Text>
                    </View>
                </View>

                {/* SEÇÃO DE PROGRESSO */}
                <View style={conteudoStyle.cardPreferencias}>
                    <View style={conteudoStyle.itemProgresso}>
                        <View style={conteudoStyle.itemProgressoHeader}>
                            <MaterialCommunityIcons name="book-open" size={20} color="#60519b" />
                            <Text style={conteudoStyle.itemProgressoTitulo}>Cursos Completos</Text>
                        </View>
                        <Text style={conteudoStyle.itemProgressoValor}>{usuario.cursosCompletos}</Text>
                    </View>

                    <View style={conteudoStyle.separador} />

                    <View style={conteudoStyle.itemProgresso}>
                        <View style={conteudoStyle.itemProgressoHeader}>
                            <MaterialCommunityIcons name="trophy" size={20} color="#60519b" />
                            <Text style={conteudoStyle.itemProgressoTitulo}>Conquistas</Text>
                        </View>
                        <Text style={conteudoStyle.itemProgressoValor}>5</Text>
                    </View>
                </View>

                {/* SEÇÃO DE PREFERÊNCIAS */}
                <View style={conteudoStyle.cardPreferencias}>
                    <View style={conteudoStyle.itemPreferencia}>
                        <View style={conteudoStyle.itemPreferenciaContent}>
                            <MaterialCommunityIcons name="bell" size={20} color="#60519b" />
                            <Text style={conteudoStyle.itemPreferenciaTexto}>Notificações</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#7061ab" />
                    </View>

                    <View style={conteudoStyle.separador} />

                    <View style={conteudoStyle.itemPreferencia}>
                        <View style={conteudoStyle.itemPreferenciaContent}>
                            <MaterialCommunityIcons name="palette" size={20} color="#60519b" />
                            <Text style={conteudoStyle.itemPreferenciaTexto}>Tema</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#7061ab" />
                    </View>

                    <View style={conteudoStyle.separador} />

                    <View style={conteudoStyle.itemPreferencia}>
                        <View style={conteudoStyle.itemPreferenciaContent}>
                            <MaterialCommunityIcons name="lock" size={20} color="#60519b" />
                            <Text style={conteudoStyle.itemPreferenciaTexto}>Privacidade</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#7061ab" />
                    </View>
                </View>

                {/* BOTÃO DE LOGOUT */}
                <Pressable
                    style={[conteudoStyle.botao, conteudoStyle.botaoLogout, { marginTop: 20, marginBottom: 30 }]}
                    onPress={handleLogout}
                >
                    <MaterialCommunityIcons name="logout" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={conteudoStyle.textoBotao}>Sair da Conta</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}
