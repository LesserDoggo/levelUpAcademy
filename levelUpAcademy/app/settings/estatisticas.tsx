import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import * as XLSX from "xlsx";
import { listarCursosCatalogo, listarModulosCurso } from "../services/courseCatalogService";
import { useAuth } from "../context/AuthContext";
import mascara from "../css/style";
import { settingsStyles } from "./styles";

type PeriodoFiltro = "todos" | "7d" | "30d" | "90d";
type TipoConsulta = "cursos" | "avaliacoes" | "suporte";

interface LinhaConsulta {
  id: string;
  tipo: TipoConsulta;
  titulo: string;
  categoria: string;
  status: string;
  valor: string;
  data: string;
}

interface CursoDetalhadoDashboard {
  curso: ReturnType<typeof listarCursosCatalogo>[number];
  percentual: number;
  concluidos: number;
  totalModulos: number;
  atualizadoEm?: string;
  concluido: boolean;
}

function dataDentroPeriodo(dataIso: string | undefined, periodo: PeriodoFiltro) {
  if (periodo === "todos" || !dataIso) return true;
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return true;
  const dias = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  const limite = new Date();
  limite.setDate(limite.getDate() - dias);
  return data >= limite;
}

function formatarData(dataIso: string | undefined) {
  if (!dataIso) return "Sem data";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "Sem data";
  return data.toLocaleDateString("pt-BR");
}

function baixarArquivo(nome: string, conteudo: BlobPart, tipo: string) {
  if (Platform.OS !== "web") {
    Alert.alert("Exportacao", "A exportacao de arquivos esta disponivel na versao web.");
    return;
  }

  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}

function sanitizarPdf(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()\\]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

function quebrarLinhaPdf(texto: string, limite = 92) {
  const palavras = sanitizarPdf(texto).split(/\s+/);
  const linhas: string[] = [];
  let atual = "";

  palavras.forEach((palavra) => {
    const candidata = atual ? `${atual} ${palavra}` : palavra;
    if (candidata.length > limite) {
      if (atual) linhas.push(atual);
      atual = palavra;
    } else {
      atual = candidata;
    }
  });

  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [""];
}

function gerarPdfRelatorio(params: {
  filtros: string;
  kpis: { label: string; value: string | number }[];
  cursos: CursoDetalhadoDashboard[];
  mediaProgresso: number;
  mediaAvaliacoes: number;
  chamadosAbertos: number;
  cursosCompletos: number;
  linhas: LinhaConsulta[];
}) {
  const linhasRelatorio: string[] = [
    "RELATORIO DA CONTA - LEVELUP ACADEMY",
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    `Filtros aplicados: ${params.filtros}`,
    "",
    "1. INDICADORES PRINCIPAIS",
    ...params.kpis.map((kpi) => `- ${kpi.label}: ${kpi.value}`),
    "",
    "2. GRAFICOS E CONSOLIDADOS",
    `- Progresso geral medio: ${Math.round(params.mediaProgresso * 100)}%`,
    `- Media das avaliacoes: ${params.mediaAvaliacoes.toFixed(1)} / 5`,
    `- Chamados em aberto: ${params.chamadosAbertos}`,
    `- Cursos concluidos: ${params.cursosCompletos}`,
    "",
    "3. CURSOS POR PROGRESSO",
    ...params.cursos.map((item) =>
      `- ${item.curso.titulo}: ${Math.round(item.percentual * 100)}% | ${item.concluidos}/${item.totalModulos} modulos | ${item.concluido ? "Concluido" : item.concluidos > 0 ? "Em andamento" : "Nao iniciado"} | Atualizado em ${formatarData(item.atualizadoEm)}`
    ),
    "",
    "4. CONSULTAS FILTRADAS",
    ...(params.linhas.length
      ? params.linhas.flatMap((linha) => [
          `- ${linha.data} | ${linha.tipo.toUpperCase()} | ${linha.status}`,
          `  Titulo: ${linha.titulo}`,
          `  Categoria/E-mail: ${linha.categoria}`,
          `  Valor: ${linha.valor}`,
        ])
      : ["Nenhum resultado encontrado para os filtros atuais."]),
  ].flatMap((linha) => quebrarLinhaPdf(linha));

  const linhasPorPagina = 50;
  const paginas = Array.from({ length: Math.ceil(linhasRelatorio.length / linhasPorPagina) }, (_, index) =>
    linhasRelatorio.slice(index * linhasPorPagina, (index + 1) * linhasPorPagina)
  );

  const objetos: string[] = [];
  const paginaRefs: number[] = [];
  const catalogRef = 1;
  const pagesRef = 2;
  const fontRef = 3;
  let proximoRef = 4;

  objetos[catalogRef] = `1 0 obj\n<< /Type /Catalog /Pages ${pagesRef} 0 R >>\nendobj\n`;
  objetos[fontRef] = `${fontRef} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  paginas.forEach((pagina) => {
    const pageRef = proximoRef;
    const contentRef = proximoRef + 1;
    proximoRef += 2;
    paginaRefs.push(pageRef);

    const comandos = pagina
      .map((linha) => `(${sanitizarPdf(linha).slice(0, 110)}) Tj T*`)
      .join("\n");
    const stream = `BT /F1 10 Tf 40 800 Td 14 TL\n${comandos}\nET`;

    objetos[pageRef] =
      `${pageRef} 0 obj\n<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRef} 0 R >> >> /Contents ${contentRef} 0 R >>\nendobj\n`;
    objetos[contentRef] =
      `${contentRef} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  });

  objetos[pagesRef] =
    `${pagesRef} 0 obj\n<< /Type /Pages /Kids [${paginaRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${paginaRefs.length} >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objetos.filter(Boolean).forEach((objeto) => {
    offsets.push(pdf.length);
    pdf += objeto;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${offsets.length} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function textoCurto(valor: string, limite = 13) {
  return valor.length > limite ? `${valor.slice(0, limite - 3)}...` : valor;
}

function DonutChart({ percentual }: { percentual: number }) {
  const raio = 44;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = circunferencia * Math.max(0, Math.min(1, percentual));

  return (
    <Svg width={120} height={120}>
      <G rotation="-90" origin="60,60">
        <Circle cx={60} cy={60} r={raio} stroke="#2e354d" strokeWidth={14} fill="none" />
        <Circle
          cx={60}
          cy={60}
          r={raio}
          stroke="#47d18c"
          strokeWidth={14}
          fill="none"
          strokeDasharray={`${preenchido},${circunferencia}`}
          strokeLinecap="round"
        />
      </G>
      <SvgText x={60} y={66} fill="#ffffff" fontSize={18} fontWeight="700" textAnchor="middle">
        {Math.round(percentual * 100)}%
      </SvgText>
    </Svg>
  );
}

function BarChart({ dados }: { dados: { id: string; label: string; valor: number }[] }) {
  const max = Math.max(...dados.map((item) => item.valor), 1);

  return (
    <Svg width="100%" height={170} viewBox="0 0 320 170">
      <Line x1={24} y1={132} x2={300} y2={132} stroke="#3b435c" strokeWidth={1} />
      {dados.map((item, index) => {
        const largura = 34;
        const x = 42 + index * 66;
        const altura = Math.max(8, (item.valor / max) * 95);
        return (
          <G key={item.label}>
            <Rect x={x} y={132 - altura} width={largura} height={altura} fill="#7c1272" rx={4} />
            <SvgText x={x + largura / 2} y={122 - altura} fill="#ffffff" fontSize={11} textAnchor="middle">
              {item.valor}
            </SvgText>
            <SvgText x={x + largura / 2} y={152} fill="#bfc0d1" fontSize={10} textAnchor="middle">
              {textoCurto(item.label, 11)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function EstatisticasConta() {
  const router = useRouter();
  const { dadosUsuario, user } = useAuth();
  const cursos = useMemo(() => listarCursosCatalogo(), []);

  const [periodo, setPeriodo] = useState<PeriodoFiltro>("todos");
  const [tipo, setTipo] = useState<TipoConsulta | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<"data" | "titulo" | "status">("data");
  const [pagina, setPagina] = useState(1);
  const [cursoExpandidoId, setCursoExpandidoId] = useState<string | null>(null);

  const progressos = useMemo(() => dadosUsuario?.cursosProgresso ?? {}, [dadosUsuario?.cursosProgresso]);
  const avaliacoes = useMemo(() => dadosUsuario?.avaliacoesApp ?? [], [dadosUsuario?.avaliacoesApp]);
  const chamados = useMemo(() => dadosUsuario?.solicitacoesSuporte ?? [], [dadosUsuario?.solicitacoesSuporte]);

  const cursosDetalhados = useMemo<CursoDetalhadoDashboard[]>(() => (
    cursos.map((curso) => {
      const progresso = progressos[curso.id];
      const totalModulos = listarModulosCurso(curso).length;
      const concluidos = progresso?.modulosConcluidos?.length ?? 0;
      return {
        curso,
        percentual: totalModulos === 0 ? 0 : concluidos / totalModulos,
        concluidos,
        totalModulos,
        atualizadoEm: typeof progresso?.atualizadoEm === "string" ? progresso.atualizadoEm : undefined,
        concluido: Boolean(progresso?.concluido),
      };
    })
  ), [cursos, progressos]);

  const cursosIniciados = cursosDetalhados.filter((item) => item.concluidos > 0);
  const mediaProgresso = cursosDetalhados.length === 0
    ? 0
    : cursosDetalhados.reduce((total, item) => total + item.percentual, 0) / cursosDetalhados.length;
  const mediaAvaliacoes = avaliacoes.length === 0
    ? 0
    : avaliacoes.reduce((total, item) => total + item.nota, 0) / avaliacoes.length;

  const linhas = useMemo<LinhaConsulta[]>(() => {
    const linhasCursos: LinhaConsulta[] = cursosDetalhados.map((item) => ({
      id: item.curso.id,
      tipo: "cursos",
      titulo: item.curso.titulo,
      categoria: item.curso.categoria.join(", "),
      status: item.concluido ? "Concluido" : item.concluidos > 0 ? "Em andamento" : "Nao iniciado",
      valor: `${Math.round(item.percentual * 100)}% (${item.concluidos}/${item.totalModulos})`,
      data: formatarData(item.atualizadoEm),
    }));

    const linhasAvaliacoes: LinhaConsulta[] = avaliacoes.map((avaliacao) => ({
      id: avaliacao.id,
      tipo: "avaliacoes",
      titulo: avaliacao.comentario || "Avaliacao sem comentario",
      categoria: "Feedback",
      status: `${avaliacao.nota}/5 estrelas`,
      valor: avaliacao.comentario || "-",
      data: formatarData(avaliacao.criadoEm),
    }));

    const linhasSuporte: LinhaConsulta[] = chamados.map((chamado) => ({
      id: chamado.id,
      tipo: "suporte",
      titulo: chamado.mensagem,
      categoria: chamado.email ?? user?.email ?? "Sem e-mail",
      status: chamado.status,
      valor: chamado.mensagem,
      data: formatarData(chamado.criadoEm),
    }));

    const termo = busca.trim().toLowerCase();
    return [...linhasCursos, ...linhasAvaliacoes, ...linhasSuporte]
      .filter((linha) => tipo === "todos" || linha.tipo === tipo)
      .filter((linha) => !termo || `${linha.titulo} ${linha.categoria} ${linha.status}`.toLowerCase().includes(termo))
      .filter((linha) => {
        const origem = linha.tipo === "cursos"
          ? cursosDetalhados.find((item) => item.curso.id === linha.id)?.atualizadoEm
          : linha.tipo === "avaliacoes"
            ? avaliacoes.find((item) => item.id === linha.id)?.criadoEm
            : chamados.find((item) => item.id === linha.id)?.criadoEm;
        return dataDentroPeriodo(origem, periodo);
      })
      .sort((a, b) => {
        if (ordenacao === "titulo") return a.titulo.localeCompare(b.titulo);
        if (ordenacao === "status") return a.status.localeCompare(b.status);
        return b.data.localeCompare(a.data);
      });
  }, [avaliacoes, busca, chamados, cursosDetalhados, ordenacao, periodo, tipo, user?.email]);

  const itensPorPagina = 6;
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / itensPorPagina));
  const linhasPagina = linhas.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);
  const filtrosTexto = `periodo=${periodo}; tipo=${tipo}; busca=${busca || "nenhuma"}; ordenacao=${ordenacao}`;
  const chamadosAbertos = chamados.filter((item) => item.status !== "resolvido").length;
  const cursosCompletos = dadosUsuario?.cursosCompletos ?? 0;
  const kpis = [
    { label: "XP total", value: dadosUsuario?.xpTotal ?? 0, icon: "diamond" },
    { label: "Moedas", value: dadosUsuario?.moedas ?? 0, icon: "currency-usd" },
    { label: "Cursos iniciados", value: cursosIniciados.length, icon: "book-open-page-variant" },
    { label: "Chamados", value: chamados.length, icon: "message-alert-outline" },
  ];
  const dadosBarras = cursosDetalhados.slice(0, 4).map((item) => ({
    id: item.curso.id,
    label: item.curso.titulo,
    valor: Math.round(item.percentual * 100),
  }));

  function exportarXlsx() {
    const workbook = XLSX.utils.book_new();
    const resumo = [
      ["Relatorio da Conta - LevelUp Academy"],
      ["Gerado em", new Date().toLocaleString("pt-BR")],
      ["Filtros aplicados", filtrosTexto],
      [],
      ["Indicador", "Valor"],
      ...kpis.map((item) => [item.label, item.value]),
      ["Progresso geral medio", `${Math.round(mediaProgresso * 100)}%`],
      ["Media das avaliacoes", Number(mediaAvaliacoes.toFixed(1))],
      ["Chamados em aberto", chamadosAbertos],
      ["Cursos concluidos", cursosCompletos],
    ];
    const cursosSheet = cursosDetalhados.map((item) => ({
      Curso: item.curso.titulo,
      Categorias: item.curso.categoria.join(", "),
      Status: item.concluido ? "Concluido" : item.concluidos > 0 ? "Em andamento" : "Nao iniciado",
      "Progresso (%)": Math.round(item.percentual * 100),
      "Modulos concluidos": item.concluidos,
      "Total de modulos": item.totalModulos,
      "Atualizado em": formatarData(item.atualizadoEm),
    }));
    const consultasSheet = linhas.map((linha) => ({
      Data: linha.data,
      Tipo: linha.tipo,
      Titulo: linha.titulo,
      "Categoria/E-mail": linha.categoria,
      Status: linha.status,
      Valor: linha.valor,
    }));

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(resumo), "Resumo");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(cursosSheet), "Cursos");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(consultasSheet), "Consultas");

    const conteudo = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    baixarArquivo("relatorio-conta.xlsx", conteudo, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  function exportarPdf() {
    baixarArquivo(
      "relatorio-conta.pdf",
      gerarPdfRelatorio({
        filtros: filtrosTexto,
        kpis,
        cursos: cursosDetalhados,
        mediaProgresso,
        mediaAvaliacoes,
        chamadosAbertos,
        cursosCompletos,
        linhas,
      }),
      "application/pdf"
    );
  }

  return (
    <View style={[mascara.container, settingsStyles.page]}>
      <ScrollView contentContainerStyle={[settingsStyles.scrollContent, { justifyContent: "flex-start" }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace("/(tabs)/perfil")} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#bfc0d1" />
          </Pressable>
          <Text style={styles.title}>Estatisticas da Conta</Text>
        </View>

        <View style={styles.kpiGrid}>
          {kpis.map((item) => (
            <View key={item.label} style={styles.kpiCard}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color="#47d18c" />
              <Text style={styles.kpiValue}>{item.value}</Text>
              <Text style={styles.kpiLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartGrid}>
          <View style={[styles.panel, styles.centeredPanel]}>
            <Text style={styles.panelTitle}>Progresso geral</Text>
            <View style={styles.donutWrap}>
              <DonutChart percentual={mediaProgresso} />
            </View>
            <Text style={styles.panelCaption}>Media dos cursos disponiveis</Text>
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Cursos por progresso</Text>
            <BarChart dados={dadosBarras} />
            <View style={styles.chartLegend}>
              {dadosBarras.map((item) => {
                const expandido = cursoExpandidoId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setCursoExpandidoId(expandido ? null : item.id)}
                    style={styles.legendRow}
                  >
                    <Text style={styles.legendValue}>{item.valor}%</Text>
                    <Text
                      style={styles.legendText}
                      numberOfLines={expandido ? undefined : 1}
                      ellipsizeMode="tail"
                    >
                      {item.label}
                    </Text>
                    <MaterialCommunityIcons
                      name={expandido ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#bfc0d1"
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Resumo de feedback</Text>
          <Text style={styles.metricLine}>Media das avaliacoes: {mediaAvaliacoes.toFixed(1)} / 5</Text>
          <Text style={styles.metricLine}>Chamados em aberto: {chamadosAbertos}</Text>
          <Text style={styles.metricLine}>Cursos concluidos: {cursosCompletos}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Consultas e relatorios</Text>
          <TextInput
            value={busca}
            onChangeText={(valor) => {
              setBusca(valor);
              setPagina(1);
            }}
            placeholder="Buscar por curso, status, comentario ou chamado"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {(["todos", "7d", "30d", "90d"] as PeriodoFiltro[]).map((item) => (
              <Pressable key={item} onPress={() => { setPeriodo(item); setPagina(1); }} style={[styles.filterButton, periodo === item && styles.filterButtonActive]}>
                <Text style={styles.filterText}>{item === "todos" ? "Todo periodo" : item}</Text>
              </Pressable>
            ))}
            {(["todos", "cursos", "avaliacoes", "suporte"] as const).map((item) => (
              <Pressable key={item} onPress={() => { setTipo(item); setPagina(1); }} style={[styles.filterButton, tipo === item && styles.filterButtonActive]}>
                <Text style={styles.filterText}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sortRow}>
            {(["data", "titulo", "status"] as const).map((item) => (
              <Pressable key={item} onPress={() => setOrdenacao(item)} style={[styles.sortButton, ordenacao === item && styles.sortButtonActive]}>
                <Text style={styles.sortText}>Ordenar: {item}</Text>
              </Pressable>
            ))}
          </View>

          {linhasPagina.map((linha) => (
            <View key={`${linha.tipo}-${linha.id}`} style={styles.tableRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{linha.titulo}</Text>
                <Text style={styles.rowMeta}>{linha.tipo} | {linha.categoria} | {linha.data}</Text>
              </View>
              <Text style={styles.rowStatus}>{linha.status}</Text>
            </View>
          ))}

          <View style={styles.pagination}>
            <Pressable disabled={pagina === 1} onPress={() => setPagina((atual) => Math.max(1, atual - 1))} style={styles.iconButton}>
              <MaterialCommunityIcons name="chevron-left" size={22} color={pagina === 1 ? "#555" : "#bfc0d1"} />
            </Pressable>
            <Text style={styles.pageText}>{pagina} / {totalPaginas}</Text>
            <Pressable disabled={pagina === totalPaginas} onPress={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))} style={styles.iconButton}>
              <MaterialCommunityIcons name="chevron-right" size={22} color={pagina === totalPaginas ? "#555" : "#bfc0d1"} />
            </Pressable>
          </View>

          <View style={styles.exportRow}>
            <Pressable style={styles.exportButton} onPress={exportarPdf}>
              <MaterialCommunityIcons name="file-pdf-box" size={20} color="#fff" />
              <Text style={styles.exportText}>PDF</Text>
            </Pressable>
            <Pressable style={styles.exportButton} onPress={exportarXlsx}>
              <MaterialCommunityIcons name="file-excel-box" size={20} color="#fff" />
              <Text style={styles.exportText}>XLSX</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#212636",
    borderWidth: 1,
    borderColor: "#2e354d",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiGrid: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 110,
    backgroundColor: "#212636",
    borderWidth: 1,
    borderColor: "#2e354d",
    borderRadius: 8,
    padding: 14,
    justifyContent: "space-between",
  },
  kpiValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  kpiLabel: {
    color: "#bfc0d1",
    fontSize: 12,
  },
  chartGrid: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  panel: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    backgroundColor: "#212636",
    borderWidth: 1,
    borderColor: "#2e354d",
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
  },
  centeredPanel: {
    alignItems: "center",
  },
  donutWrap: {
    width: 140,
    height: 126,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  panelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  panelCaption: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
  chartLegend: {
    gap: 8,
    marginTop: 8,
  },
  legendRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#1a1f2e",
    borderWidth: 1,
    borderColor: "#2e354d",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  legendValue: {
    color: "#47d18c",
    fontSize: 13,
    fontWeight: "700",
    width: 42,
  },
  legendText: {
    color: "#bfc0d1",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  metricLine: {
    color: "#bfc0d1",
    fontSize: 14,
    marginVertical: 3,
  },
  searchInput: {
    backgroundColor: "#0c101c",
    borderWidth: 1,
    borderColor: "#60519b",
    borderRadius: 8,
    color: "#bfc0d1",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filters: {
    gap: 8,
    paddingVertical: 10,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#60519b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: "#60519b",
    borderColor: "#836fd1",
  },
  filterText: {
    color: "#fff",
    fontSize: 12,
    textTransform: "capitalize",
  },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  sortButton: {
    borderWidth: 1,
    borderColor: "#2e354d",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sortButtonActive: {
    borderColor: "#47d18c",
  },
  sortText: {
    color: "#bfc0d1",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2e354d",
    paddingVertical: 10,
  },
  rowTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  rowMeta: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 3,
  },
  rowStatus: {
    color: "#47d18c",
    fontSize: 12,
    fontWeight: "700",
    maxWidth: 110,
    textAlign: "right",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  pageText: {
    color: "#bfc0d1",
    fontWeight: "700",
  },
  exportRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#60519b",
    borderWidth: 1,
    borderColor: "#836fd1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  exportText: {
    color: "#fff",
    fontWeight: "700",
  },
});
