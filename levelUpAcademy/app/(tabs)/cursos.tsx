import MenuInf from '@/components/Menu';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

// Importando o serviço mockado
import { courseService, CursoProgresso } from '../services/courseService';

// Interface para expandir os dados de cursos
interface CursoItem extends CursoProgresso {
    descricao: string;
    categoria: string;
    aulas: number;
}

// Mock de cursos disponíveis
const cursosDisponiveis: CursoItem[] = [
    {
        id: 1,
        titulo: "Lógica de Programação",
        descricao: "Aprenda os fundamentos da lógica de programação com exemplos práticos.",
        categoria: "Programação",
        aulaAtual: "Estruturas de Repetição",
        porcentagem: 0.4,
        aulas: 12,
    },
    {
        id: 2,
        titulo: "Desenvolvimento Mobile",
        descricao: "Crie aplicativos mobile com React Native e Expo.",
        categoria: "Mobile",
        aulaAtual: "Navegação com Expo Router",
        porcentagem: 0.75,
        aulas: 18,
    },
    {
        id: 3,
        titulo: "Interface de Usuário (UI)",
        descricao: "Domine os princípios de design e criação de interfaces.",
        categoria: "Design",
        aulaAtual: "Teoria das Cores",
        porcentagem: 0.15,
        aulas: 10,
    },
    {
        id: 4,
        titulo: "Banco de Dados",
        descricao: "Aprenda SQL e modelagem de dados relacional.",
        categoria: "Backend",
        aulaAtual: "Comandos SELECT",
        porcentagem: 0.95,
        aulas: 15,
    },
    {
        id: 5,
        titulo: "TypeScript Avançado",
        descricao: "Domine tipos avançados e padrões de TypeScript.",
        categoria: "Programação",
        aulaAtual: "Generics e Tipos Utilitários",
        porcentagem: 0.0,
        aulas: 14,
    },
    {
        id: 6,
        titulo: "Segurança em Aplicações",
        descricao: "Implemente práticas de segurança em suas aplicações.",
        categoria: "Segurança",
        aulaAtual: "Autenticação e Autorização",
        porcentagem: 0.0,
        aulas: 11,
    },
];

export default function Cursos() {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const router = useRouter();

    const [busca, setBusca] = useState<string>('');
    const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');

    // Filtrar cursos baseado na busca e categoria
    const cursosFiltrados = cursosDisponiveis.filter((curso) => {
        const matchBusca = curso.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            curso.descricao.toLowerCase().includes(busca.toLowerCase());
        const matchCategoria = filtroCategoria === 'Todos' || curso.categoria === filtroCategoria;
        return matchBusca && matchCategoria;
    });

    // Obter categorias únicas
    const categorias = ['Todos', ...new Set(cursosDisponiveis.map((c) => c.categoria))];

    // Componente para renderizar cada card de curso
    const renderCursoCard = ({ item }: { item: CursoItem }) => (
        <Pressable
            style={conteudoStyle.cardCurso}
            onPress={() => {
                // Aqui você pode navegar para a tela de detalhes do curso
                // router.push(`/(tabs)/cursos/${item.id}`);
            }}
        >
            <View style={conteudoStyle.cardCursoHeader}>
                <Text style={conteudoStyle.categoriaBadge}>{item.categoria}</Text>
                <Text style={conteudoStyle.aulasTexto}>{item.aulas} aulas</Text>
            </View>

            <Text style={conteudoStyle.cardCursoTitulo}>{item.titulo}</Text>
            <Text style={conteudoStyle.cardCursoDescricao}>{item.descricao}</Text>

            {/* Barra de progresso do curso */}
            {item.porcentagem > 0 && (
                <View style={{ marginVertical: 12 }}>
                    <View style={conteudoStyle.barraFundo}>
                        <View
                            style={[
                                conteudoStyle.barraPreenchida,
                                {
                                    width: `${item.porcentagem * 100}%`,
                                    backgroundColor: courseService.getCorBarra(item.porcentagem)
                                }
                            ]}
                        />
                    </View>
                    <Text style={conteudoStyle.textoPorcentagem}>
                        {Math.round(item.porcentagem * 100)}% concluído
                    </Text>
                </View>
            )}

            <Pressable
                style={[
                    conteudoStyle.botao,
                    item.porcentagem > 0 && conteudoStyle.botaoContinuar
                ]}
            >
                <Text style={conteudoStyle.textoBotao}>
                    {item.porcentagem > 0 ? 'Continuar' : 'Iniciar'}
                </Text>
            </Pressable>
        </Pressable>
    );

    return (
        <View style={[mascara.container, { flex: 1, paddingBottom: isDesktop ? 0 : 130, paddingLeft: isDesktop ? 90 : 0, paddingTop: isDesktop ? 0 : 30 }]}>
            <MenuInf />

            {/* SEÇÃO FIXA - TÍTULO E BUSCA */}
            <View style={conteudoStyle.secaoFixaCursos}>
                <Text style={conteudoStyle.titulo}>Cursos Disponíveis</Text>

                {/* BARRA DE BUSCA */}
                <TextInput
                    placeholder="Buscar cursos..."
                    placeholderTextColor="#7061ab"
                    value={busca}
                    onChangeText={setBusca}
                    style={conteudoStyle.inputBusca}
                />

                {/* FILTRO DE CATEGORIAS */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={conteudoStyle.filtrosContainer}
                >
                    {categorias.map((categoria) => (
                        <Pressable
                            key={categoria}
                            style={[
                                conteudoStyle.botaoFiltro,
                                filtroCategoria === categoria && conteudoStyle.botaoFiltroAtivo
                            ]}
                            onPress={() => setFiltroCategoria(categoria)}
                        >
                            <Text
                                style={[
                                    conteudoStyle.textoBotaoFiltro,
                                    filtroCategoria === categoria && conteudoStyle.textoBotaoFiltroAtivo
                                ]}
                            >
                                {categoria}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* SEÇÃO COM SCROLL - LISTA DE CURSOS */}
            <View style={conteudoStyle.secaoScrollCursos}>
                {cursosFiltrados.length > 0 ? (
                    <FlatList
                        data={cursosFiltrados}
                        renderItem={renderCursoCard}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={true}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 50 }}>
                        <Text style={conteudoStyle.titulo}>Nenhum curso encontrado</Text>
                        <Text style={[conteudoStyle.subtitulo, { marginTop: 10 }]}>
                            Tente ajustar sua busca ou filtro
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}