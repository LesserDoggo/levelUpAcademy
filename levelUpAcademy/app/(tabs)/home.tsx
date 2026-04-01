import MenuInf from '@/components/Menu';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

export default function Home() {
  //PLACEHOLDER DE PROGRESSO DO CURSO ------Deletar quando implementar banco de dados
  const [progresso, setProgresso] = useState<any>(null);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <View style={[mascara.container, { flex: 1, paddingBottom: isDesktop ? 0 : 130, paddingLeft: isDesktop ? 90 : 0, paddingTop: isDesktop ? 0 : 30 }]}>
      <MenuInf />
      <View style={conteudoStyle.conteudo}>
        {progresso ? (
          // Se tiver progresso, mostra onde parou
          <View style={conteudoStyle.cardProgresso}>
            <Text style={conteudoStyle.titulo}>Continuar de onde parou</Text>
            <Text style={conteudoStyle.subtitulo}>{progresso.nomeCurso}</Text>
            <Text>Aula: {progresso.nomeAula}</Text>
          </View>
        ) : (
          // Se não tiver, mostra a sugestão
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={conteudoStyle.cardSugestao}>
              <Text style={conteudoStyle.titulo}>Você ainda não começou um curso</Text>
              <Pressable
                style={conteudoStyle.botao}
                onPress={() => router.push('/(tabs)/cursos')}
              >
                <Text style={conteudoStyle.textoBotao}>Explorar Cursos</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View >
  )
}