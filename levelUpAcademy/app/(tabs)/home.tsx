import MenuInf from '@/components/Menu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

// Importando o serviço mockado
import { courseService, CursoProgresso } from '../services/courseService';

export default function Home() {
  // PLACEHOLDER DE PROGRESSO DO CURSO
  const [progresso, setProgresso] = useState<CursoProgresso | null>(null);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const trocarCursoDebug = () => {
    const novoCurso = courseService.getCursoAtual();
    setProgresso(novoCurso);
  };

  return (
    <View style={[
      mascara.container,
      {
        flex: 1,
        paddingBottom: isDesktop ? 0 : 130,
        paddingLeft: isDesktop ? 90 : 0,
        paddingTop: isDesktop ? 0 : 0,
      }
    ]}>
      <MenuInf />


      <ScrollView
        style={[conteudoStyle.conteudo, { paddingTop: 0, paddingLeft: 0 }/*{ marginTop: 60 }*/]}
        contentContainerStyle={{ paddingTop: 0 }}
        scrollEnabled={true}
      >
        {/* HUD - HEADER DE STATUS (Fixo no topo, com padding-top no mobile) */}
        <View
          style={[
            conteudoStyle.hudContainer,
            !isDesktop && { paddingTop: 50, paddingBottom: 10 }
          ]}
        >
          <View style={conteudoStyle.hudItem}>
            <View style={conteudoStyle.hudIconContainer}>
              <MaterialCommunityIcons name="fire" size={isDesktop ? 20 : 16} color="#ff6b35" />
            </View>
            <View style={conteudoStyle.hudContent}>
              <Text style={[conteudoStyle.hudLabel, !isDesktop && { fontSize: 10 }]}>Ofensiva</Text>
              <Text style={[conteudoStyle.hudValue, !isDesktop && { fontSize: 13 }]}>3 dias</Text>
            </View>
          </View>

          <View style={conteudoStyle.hudDivider} />

          <View style={conteudoStyle.hudItem}>
            <View style={conteudoStyle.hudIconContainer}>
              <MaterialCommunityIcons name="diamond" size={isDesktop ? 20 : 16} color="#00d4ff" />
            </View>
            <View style={conteudoStyle.hudContent}>
              <Text style={[conteudoStyle.hudLabel, !isDesktop && { fontSize: 10 }]}>XP</Text>
              <Text style={[conteudoStyle.hudValue, !isDesktop && { fontSize: 13 }]}>150</Text>
            </View>
          </View>

          <View style={conteudoStyle.hudDivider} />

          <View style={conteudoStyle.hudItem}>
            <View style={conteudoStyle.hudIconContainer}>
              <MaterialCommunityIcons name="shield-sword" size={isDesktop ? 20 : 16} color="#ffd700" />
            </View>
            <View style={conteudoStyle.hudContent}>
              <Text style={[conteudoStyle.hudLabel, !isDesktop && { fontSize: 10 }]}>Nível</Text>
              <Text style={[conteudoStyle.hudValue, !isDesktop && { fontSize: 13 }]}>2</Text>
            </View>
          </View>
        </View>
        {progresso ? (
          /* CASO EXISTA PROGRESSO */
          <View style={[conteudoStyle.cardProgresso, { marginTop: isDesktop ? 100 : 150 }]}>
            <Text style={[conteudoStyle.titulo, { marginBottom: 15, fontSize: 18 }]}>Onde você parou:</Text>
            <Text style={conteudoStyle.titulo}>{progresso.titulo}</Text>
            <Text style={conteudoStyle.subtitulo}>Aula: {progresso.aulaAtual}</Text>

            {/* BARRA DE PROGRESSO DINÂMICA */}
            <View style={conteudoStyle.barraFundo}>
              <View
                style={[
                  conteudoStyle.barraPreenchida,
                  {
                    width: `${progresso.porcentagem * 100}%`,
                    backgroundColor: courseService.getCorBarra(progresso.porcentagem)
                  }
                ]}
              />
            </View>
            <Text style={conteudoStyle.textoPorcentagem}>
              {Math.round(progresso.porcentagem * 100)}% concluído
            </Text>

            <Pressable
              onPress={() => router.push('/(tabs)/cursos')}
              style={[conteudoStyle.botao, { marginTop: 15 }]}
            >
              <Text style={conteudoStyle.textoBotao}>Continuar Estudando</Text>
            </Pressable>
          </View>
        ) : (
          /* CASO NÃO TENHA PROGRESSO INICIADO */
          <View style={[{ alignItems: 'center', justifyContent: 'center', marginTop: isDesktop ? 100 : 150 }]}>
            <View style={conteudoStyle.cardSugestao}>
              <Text style={conteudoStyle.titulo}>Você ainda não começou um curso</Text>
              <Pressable
                style={conteudoStyle.botao}
                onPress={() => router.push('/(tabs)/cursos')}
              >
                <Text style={{ color: 'white' }}>Explorar Cursos</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* BOTÃO DE DEBUG - Sempre visível para testes */}
        <Pressable
          onPress={trocarCursoDebug}
          style={[conteudoStyle.botao, { backgroundColor: '#444', marginTop: 20, marginBottom: 30 }]}
        >
          <Text style={{ color: 'white', alignSelf: 'center', textAlign: 'center' }}>Simular Troca de Curso (Debug)</Text>
        </Pressable>
      </ScrollView>
    </View >
  );
}
