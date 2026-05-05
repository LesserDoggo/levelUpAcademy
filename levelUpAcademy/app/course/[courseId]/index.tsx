import { useAuth } from "@/app/context/AuthContext";
import conteudoStyle from "@/app/css/conteudostyle";
import mascara from "@/app/css/style";
import {
  buscarCursoCatalogo,
  buscarProgressoCursoUsuario,
  calcularPorcentagemCurso,
} from "@/app/services/courseCatalogService";
import MenuInf from "@/components/Menu";
import CoursePath from "@/components/course/CoursePath";
import CourseProgressBar from "@/components/course/CourseProgressBar";
import { ProgressoCursoLocal } from "@/types/course";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function CoursePathScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { width } = useWindowDimensions();
  const { dadosUsuario } = useAuth();
  const isDesktop = width > 768;

  const curso = useMemo(() => {
    if (!courseId) return null;
    return buscarCursoCatalogo(courseId);
  }, [courseId]);

  const [progresso, setProgresso] = useState<ProgressoCursoLocal | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarProgresso() {
      if (!curso) {
        setCarregando(false);
        return;
      }

      setCarregando(true);
      const progressoAtual = await buscarProgressoCursoUsuario(
        dadosUsuario?.uid,
        curso.id,
      );
      setProgresso(progressoAtual);
      setCarregando(false);
    }

    carregarProgresso();
  }, [curso, dadosUsuario?.uid]);

  if (!curso) {
    return (
      <View style={[mascara.container, { alignItems: "center" }]}>
        <Text style={conteudoStyle.titulo}>Curso nao encontrado</Text>
        <Pressable style={conteudoStyle.botao} onPress={() => router.back()}>
          <Text style={conteudoStyle.textoBotao}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const porcentagem = progresso
    ? calcularPorcentagemCurso(curso, progresso)
    : 0;

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

      <ScrollView
        style={[conteudoStyle.conteudo, { paddingHorizontal: 14 }]}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={conteudoStyle.courseHeader}>
          <Pressable
            style={conteudoStyle.courseBackButton}
            onPress={() => router.replace("/(tabs)/cursos")}
          >
            <AntDesign name="arrow-left" size={22} color="#bfc0d1" />
          </Pressable>

          <Text style={conteudoStyle.titulo}>{curso.titulo}</Text>
          <Text style={conteudoStyle.cardCursoDescricao}>{curso.descricao}</Text>
          <CourseProgressBar porcentagem={porcentagem} />
          <View style={conteudoStyle.categoryBadgesContainer}>
            {curso.categoria.map((categoria) => (
              <Text key={categoria} style={conteudoStyle.categoriaBadge}>
                {categoria}
              </Text>
            ))}
          </View>
        </View>

        {carregando || !progresso ? (
          <View style={{ paddingVertical: 30 }}>
            <ActivityIndicator color="#a855f7" />
          </View>
        ) : (
          <CoursePath
            curso={curso}
            progresso={progresso}
            onOpenModulo={(moduloId) =>
              router.push(`/course/${curso.id}/module/${moduloId}` as any)
            }
          />
        )}
      </ScrollView>
    </View>
  );
}
