import conteudoStyle from "@/app/css/conteudostyle";
import { Text, View } from "react-native";

function getCorBarraCurso(pct: number): string {
  if (pct < 0.27) return "#390b3b";
  if (pct < 0.7) return "#7c1272";
  return "#880ca7";
}

export default function CourseProgressBar({ porcentagem }: { porcentagem: number }) {
  return (
    <View style={{ width: "100%", marginVertical: 10 }}>
      <View style={conteudoStyle.barraFundo}>
        <View
          style={[
            conteudoStyle.barraPreenchida,
            {
              width: `${Math.round(porcentagem * 100)}%`,
              backgroundColor: getCorBarraCurso(porcentagem),
            },
          ]}
        />
      </View>
      <Text style={conteudoStyle.textoPorcentagem}>
        {Math.round(porcentagem * 100)}% concluido
      </Text>
    </View>
  );
}
