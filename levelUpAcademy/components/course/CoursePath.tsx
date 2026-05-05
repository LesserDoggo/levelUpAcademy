import conteudoStyle from "@/app/css/conteudostyle";
import { CursoDetalhado, ProgressoCursoLocal } from "@/types/course";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, Text, View } from "react-native";

interface CoursePathProps {
  curso: CursoDetalhado;
  progresso: ProgressoCursoLocal;
  onOpenModulo: (moduloId: string) => void;
}

export default function CoursePath({
  curso,
  progresso,
  onOpenModulo,
}: CoursePathProps) {
  return (
    <View>
      {curso.unidades.map((unidade) => (
        <View key={unidade.id} style={conteudoStyle.courseUnitSection}>
          <Text style={conteudoStyle.courseUnitTitle}>{unidade.titulo}</Text>
          <Text style={conteudoStyle.courseUnitDescription}>
            {unidade.descricao}
          </Text>

          {unidade.modulos.map((modulo) => {
            const concluido = progresso.modulosConcluidos.includes(modulo.id);

            return (
              <Pressable
                key={modulo.id}
                style={conteudoStyle.courseModuleRow}
                onPress={() => onOpenModulo(modulo.id)}
              >
                <View
                  style={[
                    conteudoStyle.courseModuleIcon,
                    concluido && conteudoStyle.courseModuleIconDone,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={concluido ? "check" : "play"}
                    size={20}
                    color="#fff"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={conteudoStyle.courseModuleTitle}>
                    {modulo.titulo}
                  </Text>
                  <Text style={conteudoStyle.courseModuleDescription}>
                    {modulo.descricao}
                  </Text>
                  <Text style={conteudoStyle.courseModuleMeta}>
                    {modulo.duracaoEstimadaMin} min | {modulo.xpRecompensa} XP
                    {modulo.moedasRecompensa ? ` | ${modulo.moedasRecompensa} moedas` : ""}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
