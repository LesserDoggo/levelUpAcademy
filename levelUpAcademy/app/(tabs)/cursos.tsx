// =============================================================================
// LEVELUP ACADEMY - app/(tabs)/cursos.tsx
// Lista de cursos baseada no catalogo real do app.
// =============================================================================

import MenuInf from "@/components/Menu";
import CourseCard from "@/components/course/CourseCard";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import conteudoStyle from "../css/conteudostyle";
import mascara from "../css/style";
import {
    buscarProgressoCursoUsuario,
    calcularPorcentagemCurso,
    listarCursosCatalogo,
} from "../services/courseCatalogService";

export default function Cursos() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { dadosUsuario } = useAuth();
    const isDesktop = width > 768;

    const cursosDisponiveis = useMemo(() => listarCursosCatalogo(), []);
    const [busca, setBusca] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("Todos");
    const [progressoPorCurso, setProgressoPorCurso] = useState<Record<string, number>>({});

    useEffect(() => {
        async function carregarProgressos() {
            const progressos = await Promise.all(
                cursosDisponiveis.map(async (curso) => {
                    const progresso = await buscarProgressoCursoUsuario(dadosUsuario?.uid, curso.id);
                    return [curso.id, calcularPorcentagemCurso(curso, progresso)] as const;
                }),
            );

            setProgressoPorCurso(Object.fromEntries(progressos));
        }

        carregarProgressos();
    }, [cursosDisponiveis, dadosUsuario?.uid]);

    const cursosFiltrados = cursosDisponiveis.filter((curso) => {
        const termoBusca = busca.toLowerCase();
        const matchBusca =
            curso.titulo.toLowerCase().includes(termoBusca) ||
            curso.descricao.toLowerCase().includes(termoBusca);
        const matchCategoria =
            filtroCategoria === "Todos" || curso.categoria.includes(filtroCategoria);

        return matchBusca && matchCategoria;
    });

    const categorias = [
        "Todos",
        ...new Set(cursosDisponiveis.flatMap((curso) => curso.categoria)),
    ];

    return (
        <View
            style={[
                mascara.container,
                {
                    flex: 1,
                    paddingBottom: isDesktop ? 0 : 130,
                    paddingLeft: isDesktop ? 90 : 0,
                    paddingTop: isDesktop ? 0 : 30,
                },
            ]}
        >
            <MenuInf />

            <View style={conteudoStyle.secaoFixaCursos}>
                <Text style={conteudoStyle.titulo}>Cursos Disponiveis</Text>

                <TextInput
                    placeholder="Buscar cursos..."
                    placeholderTextColor="#7061ab"
                    value={busca}
                    onChangeText={setBusca}
                    style={conteudoStyle.inputBusca}
                />

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
                                filtroCategoria === categoria && conteudoStyle.botaoFiltroAtivo,
                            ]}
                            onPress={() => setFiltroCategoria(categoria)}
                        >
                            <Text
                                style={[
                                    conteudoStyle.textoBotaoFiltro,
                                    filtroCategoria === categoria &&
                                    conteudoStyle.textoBotaoFiltroAtivo,
                                ]}
                            >
                                {categoria}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <View style={conteudoStyle.secaoScrollCursos}>
                {cursosFiltrados.length > 0 ? (
                    <FlatList
                        data={cursosFiltrados}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <CourseCard
                                curso={item}
                                porcentagem={progressoPorCurso[item.id] ?? 0}
                                onPress={() => router.push(`/course/${item.id}` as any)}
                            />
                        )}
                    />
                ) : (
                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 50,
                        }}
                    >
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
