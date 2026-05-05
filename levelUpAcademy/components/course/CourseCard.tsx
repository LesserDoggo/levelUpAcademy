import conteudoStyle from "@/app/css/conteudostyle";
import { CursoDetalhado } from "@/types/course";
import { Pressable, Text, View } from "react-native";
import CourseProgressBar from "./CourseProgressBar";

interface CourseCardProps {
  curso: CursoDetalhado;
  porcentagem: number;
  onPress: () => void;
}

export default function CourseCard({ curso, porcentagem, onPress }: CourseCardProps) {
  const totalModulos = curso.unidades.reduce(
    (total, unidade) => total + unidade.modulos.length,
    0,
  );

  return (
    <Pressable style={conteudoStyle.cardCurso} onPress={onPress}>
      <View style={conteudoStyle.cardCursoHeader}>
        <View style={conteudoStyle.categoryBadgesContainer}>
          {curso.categoria.map((categoria) => (
            <Text key={categoria} style={conteudoStyle.categoriaBadge}>
              {categoria}
            </Text>
          ))}
        </View>
        <Text style={conteudoStyle.aulasTexto}>{totalModulos} modulos</Text>
      </View>

      <Text style={conteudoStyle.cardCursoTitulo}>{curso.titulo}</Text>
      <Text style={conteudoStyle.cardCursoDescricao}>{curso.descricao}</Text>

      <CourseProgressBar porcentagem={porcentagem} />

      <View style={conteudoStyle.botao}>
        <Text style={conteudoStyle.textoBotao}>
          {porcentagem > 0 ? "Continuar" : "Iniciar"}
        </Text>
      </View>
    </Pressable>
  );
}
