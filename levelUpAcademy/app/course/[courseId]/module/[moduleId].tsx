import MenuInf from "@/components/Menu";
import LessonContentRenderer from "@/components/course/LessonContentRenderer";
import { useAuth } from "@/app/context/AuthContext";
import conteudoStyle from "@/app/css/conteudostyle";
import mascara from "@/app/css/style";
import {
  buscarModuloCatalogo,
  buscarProgressoCursoUsuario,
  concluirModuloCursoUsuario,
} from "@/app/services/courseCatalogService";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function CourseModuleScreen() {
  const router = useRouter();
  const { courseId, moduleId } = useLocalSearchParams<{
    courseId: string;
    moduleId: string;
  }>();
  const { width } = useWindowDimensions();
  const { dadosUsuario, recarregarDados } = useAuth();
  const isDesktop = width > 768;
  const [salvando, setSalvando] = useState(false);
  const [moduloConcluido, setModuloConcluido] = useState(false);

  const dadosModulo = useMemo(() => {
    if (!courseId || !moduleId) return null;
    return buscarModuloCatalogo(courseId, moduleId);
  }, [courseId, moduleId]);

  useEffect(() => {
    let ativo = true;

    async function carregarProgresso() {
      if (!courseId || !moduleId) return;
      const progresso = await buscarProgressoCursoUsuario(dadosUsuario?.uid, courseId);
      if (ativo) {
        setModuloConcluido(progresso.modulosConcluidos.includes(moduleId));
      }
    }

    carregarProgresso();

    return () => {
      ativo = false;
    };
  }, [courseId, dadosUsuario?.uid, moduleId]);

  async function concluirModulo() {
    if (!dadosModulo) return;
    if (!dadosUsuario?.uid) {
      Alert.alert(
        "Login necessario",
        "Entre na sua conta para salvar progresso e receber recompensas.",
      );
      return;
    }

    setSalvando(true);
    try {
      const resultado = await concluirModuloCursoUsuario(
        dadosUsuario.uid,
        dadosModulo.curso,
        dadosModulo.modulo,
      );
      await recarregarDados();
      setModuloConcluido(true);

      const moedas = dadosModulo.modulo.moedasRecompensa ?? 0;
      const mensagem = resultado.recompensaAplicada
        ? `Voce recebeu ${dadosModulo.modulo.xpRecompensa} XP${moedas > 0 ? ` e ${moedas} moedas` : ""}.`
        : "Este modulo ja estava concluido, entao a recompensa nao foi aplicada novamente.";

      Alert.alert("Modulo concluido", mensagem);
    } catch (error) {
      console.warn("Erro ao concluir modulo:", error);
      Alert.alert(
        "Erro ao salvar",
        "Nao foi possivel salvar seu progresso. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!dadosModulo) {
    return (
      <View style={[mascara.container, { alignItems: "center" }]}>
        <Text style={conteudoStyle.titulo}>Modulo nao encontrado</Text>
        <Pressable style={conteudoStyle.botao} onPress={() => router.back()}>
          <Text style={conteudoStyle.textoBotao}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const { curso, modulo } = dadosModulo;

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
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{
          paddingBottom: isDesktop ? 30 : 160,
          paddingHorizontal: isDesktop ? 14 : 10,
          width: "100%",
          maxWidth: 980,
          alignSelf: "center",
        }}
      >
        <View style={conteudoStyle.courseHeader}>
          <Pressable
            style={conteudoStyle.courseBackButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrow-left" size={22} color="#bfc0d1" />
          </Pressable>

          <Text style={conteudoStyle.categoriaBadge}>{curso.titulo}</Text>
          <Text style={conteudoStyle.titulo}>{modulo.titulo}</Text>
          <Text style={conteudoStyle.cardCursoDescricao}>{modulo.descricao}</Text>
          <Text style={conteudoStyle.courseModuleMeta}>
            {modulo.duracaoEstimadaMin} min | {modulo.xpRecompensa} XP
            {modulo.moedasRecompensa ? ` | ${modulo.moedasRecompensa} moedas` : ""}
          </Text>
        </View>

        {modulo.partes.map((parte) => (
          <LessonContentRenderer key={parte.id} parte={parte} />
        ))}

        <Pressable
          style={[
            conteudoStyle.botao,
            { marginVertical: 20 },
            moduloConcluido && { backgroundColor: "#35b779", borderColor: "#35b779" },
          ]}
          onPress={concluirModulo}
          disabled={salvando || moduloConcluido}
        >
          <Text style={conteudoStyle.textoBotao}>
            {salvando ? "Salvando..." : moduloConcluido ? "Modulo concluido" : "Concluir modulo"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
