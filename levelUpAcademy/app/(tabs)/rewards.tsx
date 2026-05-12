import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/config/firebaseConfig';
import MenuInf from '@/components/Menu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { doc, increment, runTransaction } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

type Dificuldade = 'facil' | 'medio' | 'dificil' | 'lendaria';
type RecompensaTipo = 'xp' | 'moedas' | 'cosmetico' | 'movel';

interface Recompensa {
    tipo: RecompensaTipo;
    valor: number | string;
    icone: string;
    nome: string;
}

interface MissaoDefinicao {
    id: string;
    titulo: string;
    descricao: string;
    dificuldade: Dificuldade;
    objetivo: number;
    metrica: 'modulosConcluidos' | 'nivel' | 'ofensiva' | 'cursosCompletos';
    recompensas: Recompensa[];
}

interface MissaoView extends MissaoDefinicao {
    progressoAtual: number;
    progresso: number;
    concluida: boolean;
    coletada: boolean;
}

const MISSOES: MissaoDefinicao[] = [
    {
        id: 'primeira-aula',
        titulo: 'Primeira Aula',
        descricao: 'Complete sua primeira aula de qualquer curso',
        dificuldade: 'facil',
        objetivo: 1,
        metrica: 'modulosConcluidos',
        recompensas: [
            { tipo: 'xp', valor: 50, icone: 'diamond', nome: '50 XP' },
            { tipo: 'moedas', valor: 25, icone: 'gold', nome: '25 Moedas' },
        ],
    },
    {
        id: 'tres-licoes',
        titulo: 'Tres Licoes',
        descricao: 'Complete 3 licoes em qualquer curso',
        dificuldade: 'facil',
        objetivo: 3,
        metrica: 'modulosConcluidos',
        recompensas: [
            { tipo: 'xp', valor: 100, icone: 'diamond', nome: '100 XP' },
            { tipo: 'cosmetico', valor: 'camisa_azul', icone: 'tshirt-crew', nome: 'Camisa Azul' },
        ],
    },
    {
        id: 'modulo-completo',
        titulo: 'Modulo Completo',
        descricao: 'Complete um modulo inteiro de um curso',
        dificuldade: 'medio',
        objetivo: 1,
        metrica: 'modulosConcluidos',
        recompensas: [
            { tipo: 'xp', valor: 250, icone: 'diamond', nome: '250 XP' },
            { tipo: 'moedas', valor: 100, icone: 'gold', nome: '100 Moedas' },
            { tipo: 'movel', valor: 'table_wood', icone: 'table-furniture', nome: 'Mesa de Madeira' },
        ],
    },
    {
        id: 'aprendiz',
        titulo: 'Aprendiz',
        descricao: 'Alcance o nivel 5',
        dificuldade: 'medio',
        objetivo: 5,
        metrica: 'nivel',
        recompensas: [
            { tipo: 'xp', valor: 500, icone: 'diamond', nome: '500 XP' },
            { tipo: 'cosmetico', valor: 'sneaker_white', icone: 'shoe-sneaker', nome: 'Tenis Branco' },
        ],
    },
    {
        id: 'ofensiva-7-dias',
        titulo: 'Ofensiva de 7 Dias',
        descricao: 'Mantenha uma ofensiva de 7 dias consecutivos',
        dificuldade: 'dificil',
        objetivo: 7,
        metrica: 'ofensiva',
        recompensas: [
            { tipo: 'xp', valor: 750, icone: 'diamond', nome: '750 XP' },
            { tipo: 'moedas', valor: 300, icone: 'gold', nome: '300 Moedas' },
            { tipo: 'movel', valor: 'plant_green', icone: 'flower', nome: 'Planta' },
        ],
    },
    {
        id: 'mestre-dos-cursos',
        titulo: 'Mestre dos Cursos',
        descricao: 'Complete 5 cursos diferentes',
        dificuldade: 'dificil',
        objetivo: 5,
        metrica: 'cursosCompletos',
        recompensas: [
            { tipo: 'xp', valor: 1000, icone: 'diamond', nome: '1000 XP' },
            { tipo: 'cosmetico', valor: 'glasses', icone: 'glasses', nome: 'Oculos' },
            { tipo: 'movel', valor: 'chair_blue', icone: 'chair-rolling', nome: 'Cadeira Azul' },
        ],
    },
    {
        id: 'lendario',
        titulo: 'Lendario',
        descricao: 'Alcance o nivel 20 e complete 10 cursos',
        dificuldade: 'lendaria',
        objetivo: 20,
        metrica: 'nivel',
        recompensas: [
            { tipo: 'xp', valor: 2000, icone: 'diamond', nome: '2000 XP' },
            { tipo: 'moedas', valor: 1000, icone: 'gold', nome: '1000 Moedas' },
            { tipo: 'cosmetico', valor: 'red_hat', icone: 'shield-crown', nome: 'Chapeu Vermelho' },
            { tipo: 'movel', valor: 'bed_simple', icone: 'bed', nome: 'Cama Simples' },
        ],
    },
];

function contarModulosConcluidos(dadosUsuario: any) {
    const cursosProgresso = dadosUsuario?.cursosProgresso ?? {};
    return Object.values(cursosProgresso).reduce((total: number, progresso: any) => {
        return total + (progresso?.modulosConcluidos?.length ?? 0);
    }, 0);
}

function getValorMetrica(missao: MissaoDefinicao, dadosUsuario: any) {
    if (missao.metrica === 'modulosConcluidos') return contarModulosConcluidos(dadosUsuario);
    if (missao.metrica === 'nivel') return dadosUsuario?.nivel ?? 1;
    if (missao.metrica === 'ofensiva') return dadosUsuario?.diasOfensiva ?? 0;
    return dadosUsuario?.cursosCompletos ?? 0;
}

export default function Missoes() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const { user, dadosUsuario, recarregarDados } = useAuth();
    const [filtro, setFiltro] = useState<'todas' | 'ativas' | 'completas'>('todas');
    const [coletandoId, setColetandoId] = useState<string | null>(null);

    useEffect(() => {
        recarregarDados();
    }, [recarregarDados]);

    const missoes = useMemo<MissaoView[]>(() => {
        const coletadas = (dadosUsuario as any)?.missoesColetadas ?? {};
        return MISSOES.map((missao) => {
            const progressoAtual = getValorMetrica(missao, dadosUsuario);
            const progresso = Math.min(100, Math.floor((progressoAtual / missao.objetivo) * 100));
            return {
                ...missao,
                progressoAtual,
                progresso,
                concluida: progressoAtual >= missao.objetivo,
                coletada: Boolean(coletadas[missao.id]),
            };
        });
    }, [dadosUsuario]);

    const missoesFiltradas = missoes.filter((missao) => {
        if (filtro === 'ativas') return !missao.coletada;
        if (filtro === 'completas') return missao.coletada;
        return true;
    });

    const getCoresDificuldade = (dificuldade: string) => {
        switch (dificuldade) {
            case 'facil': return { bg: '#212636', border: '#4caf50' };
            case 'medio': return { bg: '#212636', border: '#ffc107' };
            case 'dificil': return { bg: '#212636', border: '#ff5722' };
            case 'lendaria': return { bg: '#212636', border: '#9c27b0' };
            default: return { bg: '#212636', border: '#666' };
        }
    };

    const getCorRecompensa = (tipo: string): string => {
        switch (tipo) {
            case 'xp': return '#00d4ff';
            case 'moedas': return '#ffa500';
            case 'cosmetico': return '#ff69b4';
            case 'movel': return '#8b7355';
            default: return '#bfc0d1';
        }
    };

    async function coletarMissao(missao: MissaoView) {
        if (!user?.uid) {
            Alert.alert('Login necessario', 'Entre para coletar recompensas.');
            return;
        }
        if (!missao.concluida || missao.coletada) return;

        setColetandoId(missao.id);
        try {
            await runTransaction(db, async (transaction) => {
                const refUsuario = doc(db, 'usuarios', user.uid);
                const snap = await transaction.get(refUsuario);
                if (!snap.exists()) throw new Error('Usuario nao encontrado.');
                const dados = snap.data();
                if (dados?.missoesColetadas?.[missao.id]) return;

                const updates: Record<string, unknown> = {
                    [`missoesColetadas.${missao.id}`]: true,
                    atualizadoEm: new Date().toISOString(),
                };

                for (const recompensa of missao.recompensas) {
                    if (recompensa.tipo === 'xp' && typeof recompensa.valor === 'number') {
                        updates.xpTotal = increment(recompensa.valor);
                    }
                    if (recompensa.tipo === 'moedas' && typeof recompensa.valor === 'number') {
                        updates.moedas = increment(recompensa.valor);
                    }
                    if (recompensa.tipo === 'movel' && typeof recompensa.valor === 'string') {
                        updates[`inventory.furniture.${recompensa.valor}`] = increment(1);
                    }
                    if (recompensa.tipo === 'cosmetico' && typeof recompensa.valor === 'string') {
                        updates[`inventory.missionClothes.${recompensa.valor}`] = true;
                    }
                }

                transaction.update(refUsuario, updates);
            });

            await recarregarDados();
            Alert.alert('Recompensa coletada', 'A missao foi salva e as recompensas foram aplicadas.');
        } catch (error) {
            console.warn('Erro ao coletar missao:', error);
            Alert.alert('Erro', 'Nao foi possivel coletar esta missao agora.');
        } finally {
            setColetandoId(null);
        }
    }

    const renderMissao = ({ item }: { item: MissaoView }) => {
        const cores = getCoresDificuldade(item.dificuldade);
        const podeColetar = item.concluida && !item.coletada;

        return (
            <View style={[conteudoStyle.cardMissao, { backgroundColor: cores.bg, borderColor: cores.border }]}>
                <View style={conteudoStyle.missaoHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={conteudoStyle.missaoTitulo}>{item.titulo}</Text>
                        <Text style={conteudoStyle.missaoDescricao}>{item.descricao}</Text>
                    </View>
                </View>

                <View style={conteudoStyle.barraFundoMissao}>
                    <View style={[conteudoStyle.barraPreenchidaMissao, { width: `${item.progresso}%`, backgroundColor: cores.border }]} />
                </View>
                <Text style={conteudoStyle.textoPorcentagemMissao}>
                    {item.progresso}% concluido ({Math.min(item.progressoAtual, item.objetivo)}/{item.objetivo})
                </Text>

                <View style={conteudoStyle.recompensasContainer}>
                    <Text style={conteudoStyle.recompensasLabel}>Recompensas:</Text>
                    <View style={conteudoStyle.recompensasGrid}>
                        {item.recompensas.map((recompensa, index) => (
                            <View key={`${item.id}-${index}`} style={conteudoStyle.recompensaItem}>
                                <View style={conteudoStyle.recompensaIconContainer}>
                                    <MaterialCommunityIcons name={recompensa.icone as any} size={24} color={getCorRecompensa(recompensa.tipo)} />
                                </View>
                                <Text style={conteudoStyle.recompensaNome}>{recompensa.nome}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Pressable
                    style={[
                        conteudoStyle.botao,
                        item.coletada ? conteudoStyle.botaoConcluido : podeColetar ? conteudoStyle.botaoConcluido : conteudoStyle.botaoEmProgresso,
                    ]}
                    disabled={!podeColetar || coletandoId === item.id}
                    onPress={() => coletarMissao(item)}
                >
                    {coletandoId === item.id ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name={item.coletada ? 'check-circle' : podeColetar ? 'gift' : 'progress-clock'} size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={conteudoStyle.textoBotao}>{item.coletada ? 'Coletada' : podeColetar ? 'Coletar' : 'Em Progresso'}</Text>
                        </>
                    )}
                </Pressable>
            </View>
        );
    };

    return (
        <View style={[
            mascara.container,
            {
                flex: 1,
                paddingBottom: isDesktop ? 0 : 130,
                paddingLeft: isDesktop ? 90 : 0,
                paddingTop: isDesktop ? 0 : 30,
            },
        ]}>
            <MenuInf />

            <View style={conteudoStyle.secaoFixaMissoes}>
                <Text style={conteudoStyle.titulo}>Missoes e Desafios</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={conteudoStyle.filtrosContainerMissoes}>
                    {['todas', 'ativas', 'completas'].map((opcao) => (
                        <Pressable
                            key={opcao}
                            style={[conteudoStyle.botaoFiltroMissoes, filtro === opcao && conteudoStyle.botaoFiltroMissoesAtivo]}
                            onPress={() => setFiltro(opcao as any)}
                        >
                            <Text style={[conteudoStyle.textoBotaoFiltroMissoes, filtro === opcao && conteudoStyle.textoBotaoFiltroMissoesAtivo]}>
                                {opcao.charAt(0).toUpperCase() + opcao.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <View style={conteudoStyle.secaoScrollMissoes}>
                <FlatList
                    data={missoesFiltradas}
                    renderItem={renderMissao}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 50 }}>
                            <Text style={conteudoStyle.titulo}>Nenhuma missao encontrada</Text>
                            <Text style={[conteudoStyle.subtitulo, { marginTop: 10 }]}>Volte mais tarde para novas missoes</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
}
