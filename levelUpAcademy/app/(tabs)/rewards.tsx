import MenuInf from '@/components/Menu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

// Interface para Missões
interface Missao {
    id: number;
    titulo: string;
    descricao: string;
    dificuldade: 'facil' | 'medio' | 'dificil' | 'lendaria';
    progresso: number; // 0-100
    recompensas: Recompensa[];
    concluida: boolean;
}

interface Recompensa {
    tipo: 'xp' | 'moedas' | 'cosmetico' | 'movel';
    valor: number | string;
    icone: string;
    nome: string;
}

// Mock de missões
const missoesMock: Missao[] = [
    {
        id: 1,
        titulo: 'Primeira Aula',
        descricao: 'Complete sua primeira aula de qualquer curso',
        dificuldade: 'facil',
        progresso: 100,
        recompensas: [
            { tipo: 'xp', valor: 50, icone: 'diamond', nome: '50 XP' },
            { tipo: 'moedas', valor: 25, icone: 'gold', nome: '25 Moedas' },
        ],
        concluida: true,
    },
    {
        id: 2,
        titulo: 'Três Lições',
        descricao: 'Complete 3 lições em qualquer curso',
        dificuldade: 'facil',
        progresso: 66,
        recompensas: [
            { tipo: 'xp', valor: 100, icone: 'diamond', nome: '100 XP' },
            { tipo: 'cosmetico', valor: 'camisa_azul', icone: 'shirt-crew', nome: 'Camisa Azul' },
        ],
        concluida: false,
    },
    {
        id: 3,
        titulo: 'Módulo Completo',
        descricao: 'Complete um módulo inteiro de um curso',
        dificuldade: 'medio',
        progresso: 50,
        recompensas: [
            { tipo: 'xp', valor: 250, icone: 'diamond', nome: '250 XP' },
            { tipo: 'moedas', valor: 100, icone: 'gold', nome: '100 Moedas' },
            { tipo: 'movel', valor: 'mesa', icone: 'table-furniture', nome: 'Mesa de Madeira' },
        ],
        concluida: false,
    },
    {
        id: 4,
        titulo: 'Aprendiz',
        descricao: 'Alcance o nível 5',
        dificuldade: 'medio',
        progresso: 40,
        recompensas: [
            { tipo: 'xp', valor: 500, icone: 'diamond', nome: '500 XP' },
            { tipo: 'cosmetico', valor: 'botas', icone: 'boot', nome: 'Botas de Couro' },
        ],
        concluida: false,
    },
    {
        id: 5,
        titulo: 'Ofensiva de 7 Dias',
        descricao: 'Mantenha uma ofensiva de 7 dias consecutivos',
        dificuldade: 'dificil',
        progresso: 42,
        recompensas: [
            { tipo: 'xp', valor: 750, icone: 'diamond', nome: '750 XP' },
            { tipo: 'moedas', valor: 300, icone: 'gold', nome: '300 Moedas' },
            { tipo: 'movel', valor: 'estante', icone: 'bookshelf', nome: 'Estante de Livros' },
        ],
        concluida: false,
    },
    {
        id: 6,
        titulo: 'Mestre dos Cursos',
        descricao: 'Complete 5 cursos diferentes',
        dificuldade: 'dificil',
        progresso: 20,
        recompensas: [
            { tipo: 'xp', valor: 1000, icone: 'diamond', nome: '1000 XP' },
            { tipo: 'cosmetico', valor: 'traje', icone: 'suit', nome: 'Traje Executivo' },
            { tipo: 'movel', valor: 'sofa', icone: 'sofa', nome: 'Sofá Gamer' },
        ],
        concluida: false,
    },
    {
        id: 7,
        titulo: 'Lendário',
        descricao: 'Alcance o nível 20 e complete 10 cursos',
        dificuldade: 'lendaria',
        progresso: 10,
        recompensas: [
            { tipo: 'xp', valor: 2000, icone: 'diamond', nome: '2000 XP' },
            { tipo: 'moedas', valor: 1000, icone: 'gold', nome: '1000 Moedas' },
            { tipo: 'cosmetico', valor: 'capa', icone: 'cape', nome: 'Capa Lendária' },
            { tipo: 'movel', valor: 'trono', icone: 'throne', nome: 'Trono de Ouro' },
        ],
        concluida: false,
    },
];

export default function Missoes() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const router = useRouter();

    const [missoes, setMissoes] = useState<Missao[]>(missoesMock);
    const [filtro, setFiltro] = useState<'todas' | 'ativas' | 'completas'>('todas');

    const missoesFiltradas = missoes.filter((missao) => {
        if (filtro === 'ativas') return !missao.concluida;
        if (filtro === 'completas') return missao.concluida;
        return true;
    });

    const getCoresDificuldade = (dificuldade: string) => {
        switch (dificuldade) {
            case 'facil':
                return { bg: '#212636', border: '#4caf50' };
            case 'medio':
                return { bg: '#212636', border: '#ffc107' };
            case 'dificil':
                return { bg: '#212636', border: '#ff5722' };
            case 'lendaria':
                return { bg: '#212636', border: '#9c27b0' };
            default:
                return { bg: '#212636', border: '#666' };
        }
    };

    const getCorRecompensa = (tipo: string): string => {
        switch (tipo) {
            case 'xp':
                return '#00d4ff';
            case 'moedas':
                return '#ffa500';
            case 'cosmetico':
                return '#ff69b4';
            case 'movel':
                return '#8b7355';
            default:
                return '#bfc0d1';
        }
    };

    const renderMissao = ({ item }: { item: Missao }) => {
        const cores = getCoresDificuldade(item.dificuldade);

        return (
            <View
                style={[
                    conteudoStyle.cardMissao,
                    {
                        backgroundColor: cores.bg,
                        borderColor: cores.border,
                    }
                ]}
            >
                {/* HEADER COM TÍTULO E DIFICULDADE */}
                <View style={conteudoStyle.missaoHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={conteudoStyle.missaoTitulo}>{item.titulo}</Text>
                        <Text style={conteudoStyle.missaoDescricao}>{item.descricao}</Text>
                    </View>
                </View>

                {/* BARRA DE PROGRESSO */}
                <View style={conteudoStyle.barraFundoMissao}>
                    <View
                        style={[
                            conteudoStyle.barraPreenchidaMissao,
                            {
                                width: `${item.progresso}%`,
                                backgroundColor: cores.border,
                            }
                        ]}
                    />
                </View>
                <Text style={conteudoStyle.textoPorcentagemMissao}>{item.progresso}% concluído</Text>

                {/* RECOMPENSAS */}
                <View style={conteudoStyle.recompensasContainer}>
                    <Text style={conteudoStyle.recompensasLabel}>Recompensas:</Text>
                    <View style={conteudoStyle.recompensasGrid}>
                        {item.recompensas.map((recompensa, index) => (
                            <View key={index} style={conteudoStyle.recompensaItem}>
                                <View style={conteudoStyle.recompensaIconContainer}>
                                    <MaterialCommunityIcons
                                        name={recompensa.icone as any}
                                        size={24}
                                        color={getCorRecompensa(recompensa.tipo)}
                                    />
                                </View>
                                <Text style={conteudoStyle.recompensaNome}>{recompensa.nome}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* BOTÃO DE AÇÃO */}
                {item.concluida ? (
                    <Pressable
                        style={[conteudoStyle.botao, conteudoStyle.botaoConcluido]}
                        onPress={() => {
                            // Coletar recompensa
                            const novasMissoes = missoes.map((m) =>
                                m.id === item.id ? { ...m, concluida: false, progresso: 0 } : m
                            );
                            setMissoes(novasMissoes);
                        }}
                    >
                        <MaterialCommunityIcons name="gift" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={conteudoStyle.textoBotao}>Coletar</Text>
                    </Pressable>
                ) : (
                    <Pressable style={[conteudoStyle.botao, conteudoStyle.botaoEmProgresso]}>
                        <Text style={conteudoStyle.textoBotao}>Em Progresso</Text>
                    </Pressable>
                )}
            </View>
        );
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

            {/* SEÇÃO FIXA - TÍTULO E FILTROS */}
            <View style={conteudoStyle.secaoFixaMissoes}>
                <Text style={conteudoStyle.titulo}>Missões e Desafios</Text>

                {/* FILTROS */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={conteudoStyle.filtrosContainerMissoes}
                >
                    {['todas', 'ativas', 'completas'].map((opcao) => (
                        <Pressable
                            key={opcao}
                            style={[
                                conteudoStyle.botaoFiltroMissoes,
                                filtro === opcao && conteudoStyle.botaoFiltroMissoesAtivo
                            ]}
                            onPress={() => setFiltro(opcao as any)}
                        >
                            <Text
                                style={[
                                    conteudoStyle.textoBotaoFiltroMissoes,
                                    filtro === opcao && conteudoStyle.textoBotaoFiltroMissoesAtivo
                                ]}
                            >
                                {opcao.charAt(0).toUpperCase() + opcao.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* SEÇÃO COM SCROLL - LISTA DE MISSÕES */}
            <View style={conteudoStyle.secaoScrollMissoes}>
                {missoesFiltradas.length > 0 ? (
                    <FlatList
                        data={missoesFiltradas}
                        renderItem={renderMissao}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={true}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 50 }}>
                        <Text style={conteudoStyle.titulo}>Nenhuma missão encontrada</Text>
                        <Text style={[conteudoStyle.subtitulo, { marginTop: 10 }]}>
                            Volte mais tarde para novas missões
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
