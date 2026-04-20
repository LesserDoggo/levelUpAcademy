// =============================================================================
// LEVELUP ACADEMY — app/(tabs)/home.tsx
// CORREÇÃO #5: card de moedas usa flexDirection:'column' no mobile para evitar
// que o botão "Ver Missões" saia da tela. Route corrigida para /(tabs)/rewards.
// =============================================================================

import MenuInf from '@/components/Menu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import conteudoStyle from '../css/conteudostyle';
import mascara from '../css/style';

import { useAuth } from '../context/AuthContext';
import { CursoProgresso, getCorBarra, getCursoAtual } from '../services/courseService';
//import { seedCursoPDF } from '../services/courseService';

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const { dadosUsuario, carregando: carregandoAuth } = useAuth();

  const [progresso, setProgresso] = useState<CursoProgresso | null>(null);
  const [carregandoCurso, setCarregandoCurso] = useState(true);

  useEffect(() => {
    //seedCursoPDF(); // Executa uma vez e não duplica (verifica se já existe)

    async function carregarProgresso() {
      if (!dadosUsuario?.uid) {
        setCarregandoCurso(false);
        return;
      }
      setCarregandoCurso(true);
      try {
        const cursoParcial = await getCursoAtual(dadosUsuario.uid);
        setProgresso(cursoParcial);
      } catch (e) {
        console.warn('Erro ao carregar curso atual:', e);
        setProgresso(null);
      } finally {
        setCarregandoCurso(false);
      }
    }
    carregarProgresso();
  }, [dadosUsuario?.uid]);

  if (carregandoAuth) {
    return (
      <View style={[mascara.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  const nomeExibido = dadosUsuario?.nome ?? 'Aventureiro';

  return (
    <View style={[
      mascara.container,
      { flex: 1, paddingBottom: isDesktop ? 0 : 130, paddingLeft: isDesktop ? 90 : 0 },
    ]}>
      <MenuInf />

      <ScrollView
        style={[conteudoStyle.conteudo, { paddingTop: 0, paddingLeft: 0 }]}
        contentContainerStyle={{ paddingTop: 0 }}
        scrollEnabled={true}
      >
        {/* ── HUD DE STATUS ──────────────────────────────────────────── */}
        <View style={[conteudoStyle.hudContainer, !isDesktop && { paddingTop: 50, paddingBottom: 10 }]}>
          <View style={conteudoStyle.hudItem}>
            <View style={conteudoStyle.hudIconContainer}>
              <MaterialCommunityIcons name="fire" size={isDesktop ? 20 : 16} color="#ff6b35" />
            </View>
            <View style={conteudoStyle.hudContent}>
              <Text style={[conteudoStyle.hudLabel, !isDesktop && { fontSize: 10 }]}>Ofensiva</Text>
              <Text style={[conteudoStyle.hudValue, !isDesktop && { fontSize: 13 }]}>
                {dadosUsuario ? `${dadosUsuario.diasOfensiva} dias` : '—'}
              </Text>
            </View>
          </View>

          <View style={conteudoStyle.hudDivider} />

          <View style={conteudoStyle.hudItem}>
            <View style={conteudoStyle.hudIconContainer}>
              <MaterialCommunityIcons name="diamond" size={isDesktop ? 20 : 16} color="#00d4ff" />
            </View>
            <View style={conteudoStyle.hudContent}>
              <Text style={[conteudoStyle.hudLabel, !isDesktop && { fontSize: 10 }]}>XP</Text>
              <Text style={[conteudoStyle.hudValue, !isDesktop && { fontSize: 13 }]}>
                {dadosUsuario ? dadosUsuario.xpTotal : '—'}
              </Text>
            </View>
          </View>

          <View style={conteudoStyle.hudDivider} />

          <View style={conteudoStyle.hudItem}>
            <View style={conteudoStyle.hudIconContainer}>
              <MaterialCommunityIcons name="shield-sword" size={isDesktop ? 20 : 16} color="#ffd700" />
            </View>
            <View style={conteudoStyle.hudContent}>
              <Text style={[conteudoStyle.hudLabel, !isDesktop && { fontSize: 10 }]}>Nível</Text>
              <Text style={[conteudoStyle.hudValue, !isDesktop && { fontSize: 13 }]}>
                {dadosUsuario ? dadosUsuario.nivel : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── SAUDAÇÃO ────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginTop: isDesktop ? 80 : 130 }}>
          <Text style={[conteudoStyle.titulo, { marginBottom: 4 }]}>
            Olá, {nomeExibido}! 👋
          </Text>
        </View>

        {/* ── CARD DE PROGRESSO DO CURSO ──────────────────────────────── */}
        {carregandoCurso ? (
          <View style={[conteudoStyle.cardProgresso, { alignItems: 'center', paddingVertical: 30 }]}>
            <ActivityIndicator color="#a855f7" />
            <Text style={[conteudoStyle.subtitulo, { marginTop: 8 }]}>Carregando seu progresso...</Text>
          </View>
        ) : progresso ? (
          <View style={conteudoStyle.cardProgresso}>
            <Text style={[conteudoStyle.titulo, { marginBottom: 15, fontSize: 18 }]}>Onde você parou:</Text>
            <Text style={conteudoStyle.titulo}>{progresso.titulo}</Text>
            <Text style={conteudoStyle.subtitulo}>Aula: {progresso.aulaAtual}</Text>

            <View style={conteudoStyle.barraFundo}>
              <View
                style={[
                  conteudoStyle.barraPreenchida,
                  { width: `${progresso.porcentagem * 100}%`, backgroundColor: getCorBarra(progresso.porcentagem) },
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
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={conteudoStyle.cardSugestao}>
              <Text style={conteudoStyle.titulo}>Você ainda não começou um curso</Text>
              <Pressable style={conteudoStyle.botao} onPress={() => router.push('/(tabs)/cursos')}>
                <Text style={{ color: 'white' }}>Explorar Cursos</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── CARD DE MOEDAS ──────────────────────────────────────────── */}
        {dadosUsuario && (
          <View style={[
            conteudoStyle.cardSugestao,
            {
              // CORREÇÃO #5: coluna no mobile para evitar overflow do botão
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: isDesktop ? 'space-between' : 'center',
              marginTop: 16,
              marginHorizontal: 20,
              gap: 12,
            },
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="currency-usd" size={28} color="#ffd700" />
              <View>
                <Text style={[conteudoStyle.hudLabel, { fontSize: 12 }]}>Suas Moedas</Text>
                <Text style={[conteudoStyle.hudValue, { fontSize: 20, color: '#ffd700' }]}>
                  {dadosUsuario.moedas}
                </Text>
              </View>
            </View>

            <Pressable
              style={[conteudoStyle.botao, { marginTop: 0, margin: 0 }]}
              // CORREÇÃO: rota corrigida para 'rewards' (nome real do arquivo)
              onPress={() => router.push('/(tabs)/rewards')}
            >
              <Text style={conteudoStyle.textoBotao}>Ver Missões</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
