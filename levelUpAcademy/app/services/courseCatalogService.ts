import AsyncStorage from "@react-native-async-storage/async-storage";
import { cursosCatalogo } from "../data/programacaoJavascriptWebCourse";
import {
  CursoDetalhado,
  ModuloCurso,
  ProgressoCursoLocal,
  ProgressoCursoUsuario,
} from "@/types/course";
import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

function getChaveProgresso(uid: string | undefined, cursoId: string) {
  return `levelup:curso:${uid ?? "visitante"}:${cursoId}:progresso`;
}

function calcularNivelPorXp(xpTotal: number) {
  return Math.max(1, Math.floor(xpTotal / 500) + 1);
}

function formatarDiaOfensiva(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function getDiaAnterior(data = new Date()) {
  const diaAnterior = new Date(data);
  diaAnterior.setDate(diaAnterior.getDate() - 1);
  return formatarDiaOfensiva(diaAnterior);
}

export function listarCursosCatalogo(): CursoDetalhado[] {
  return cursosCatalogo;
}

export function buscarCursoCatalogo(cursoId: string): CursoDetalhado | null {
  return cursosCatalogo.find((curso) => curso.id === cursoId) ?? null;
}

export function listarModulosCurso(curso: CursoDetalhado): ModuloCurso[] {
  return curso.unidades.flatMap((unidade) => unidade.modulos);
}

export function buscarModuloCatalogo(
  cursoId: string,
  moduloId: string,
): { curso: CursoDetalhado; modulo: ModuloCurso } | null {
  const curso = buscarCursoCatalogo(cursoId);
  if (!curso) return null;

  for (const unidade of curso.unidades) {
    const modulo = unidade.modulos.find((item) => item.id === moduloId);
    if (modulo) return { curso, modulo };
  }

  return null;
}

export async function buscarProgressoCursoLocal(
  uid: string | undefined,
  cursoId: string,
): Promise<ProgressoCursoLocal> {
  const chave = getChaveProgresso(uid, cursoId);
  const valor = await AsyncStorage.getItem(chave);

  if (!valor) {
    return {
      cursoId,
      modulosConcluidos: [],
      ultimoModuloId: null,
      atualizadoEm: new Date().toISOString(),
    };
  }

  return JSON.parse(valor) as ProgressoCursoLocal;
}

export async function buscarProgressoCursoUsuario(
  uid: string | undefined,
  cursoId: string,
): Promise<ProgressoCursoLocal> {
  if (!uid) return buscarProgressoCursoLocal(uid, cursoId);

  const snap = await getDoc(doc(db, "usuarios", uid));
  const progresso = snap.data()?.cursosProgresso?.[cursoId] as
    | ProgressoCursoUsuario
    | undefined;

  if (!progresso) return buscarProgressoCursoLocal(uid, cursoId);

  return {
    cursoId,
    modulosConcluidos: progresso.modulosConcluidos ?? [],
    ultimoModuloId: progresso.ultimoModuloId ?? null,
    atualizadoEm: progresso.atualizadoEm,
  };
}

export async function concluirModuloCursoLocal(
  uid: string | undefined,
  cursoId: string,
  moduloId: string,
): Promise<ProgressoCursoLocal> {
  const progresso = await buscarProgressoCursoLocal(uid, cursoId);
  const modulosConcluidos = [
    ...new Set([...progresso.modulosConcluidos, moduloId]),
  ];

  const novoProgresso: ProgressoCursoLocal = {
    cursoId,
    modulosConcluidos,
    ultimoModuloId: moduloId,
    atualizadoEm: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    getChaveProgresso(uid, cursoId),
    JSON.stringify(novoProgresso),
  );

  return novoProgresso;
}

export async function concluirModuloCursoUsuario(
  uid: string,
  curso: CursoDetalhado,
  modulo: ModuloCurso,
): Promise<{ progresso: ProgressoCursoUsuario; recompensaAplicada: boolean }> {
  const usuarioRef = doc(db, "usuarios", uid);
  const totalModulos = listarModulosCurso(curso).length;

  const resultado = await runTransaction(db, async (transaction) => {
    const usuarioSnap = await transaction.get(usuarioRef);

    if (!usuarioSnap.exists()) {
      throw new Error("Usuario nao encontrado.");
    }

    const dadosUsuario = usuarioSnap.data();
    const progressoAtual = dadosUsuario.cursosProgresso?.[curso.id] as
      | ProgressoCursoUsuario
      | undefined;
    const modulosAtuais = progressoAtual?.modulosConcluidos ?? [];
    const moduloJaConcluido = modulosAtuais.includes(modulo.id);
    const modulosConcluidos = moduloJaConcluido
      ? modulosAtuais
      : [...modulosAtuais, modulo.id];
    const porcentagem =
      totalModulos === 0 ? 0 : modulosConcluidos.length / totalModulos;
    const cursoConcluidoAgora = porcentagem >= 1;
    const xpRecompensa = moduloJaConcluido ? 0 : modulo.xpRecompensa;
    const moedasRecompensa = moduloJaConcluido
      ? 0
      : modulo.moedasRecompensa ?? 0;
    const xpAtual = typeof dadosUsuario.xpTotal === "number" ? dadosUsuario.xpTotal : 0;
    const hojeOfensiva = formatarDiaOfensiva();
    const ontemOfensiva = getDiaAnterior();
    const ultimaOfensiva = dadosUsuario.ultimaOfensivaEm as string | undefined;
    const diasOfensivaAtual =
      typeof dadosUsuario.diasOfensiva === "number" ? dadosUsuario.diasOfensiva : 0;
    const diasOfensiva =
      !moduloJaConcluido && ultimaOfensiva !== hojeOfensiva
        ? ultimaOfensiva === ontemOfensiva
          ? diasOfensivaAtual + 1
          : 1
        : diasOfensivaAtual;

    const novoProgresso: ProgressoCursoUsuario = {
      cursoId: curso.id,
      titulo: curso.titulo,
      modulosConcluidos,
      ultimoModuloId: modulo.id,
      porcentagem,
      xpGanho: (progressoAtual?.xpGanho ?? 0) + xpRecompensa,
      moedasGanhas: (progressoAtual?.moedasGanhas ?? 0) + moedasRecompensa,
      concluido: cursoConcluidoAgora,
      atualizadoEm: new Date().toISOString(),
    };
    const cursosProgresso = {
      ...(dadosUsuario.cursosProgresso ?? {}),
      [curso.id]: novoProgresso,
    };
    const cursosCompletos = Object.values(cursosProgresso).filter(
      (progresso) => Boolean((progresso as ProgressoCursoUsuario).concluido),
    ).length;

    transaction.update(usuarioRef, {
      [`cursosProgresso.${curso.id}`]: {
        ...novoProgresso,
        atualizadoEm: serverTimestamp(),
      },
      ...(xpRecompensa > 0 ? { xpTotal: increment(xpRecompensa) } : {}),
      ...(xpRecompensa > 0 ? { nivel: calcularNivelPorXp(xpAtual + xpRecompensa) } : {}),
      ...(moedasRecompensa > 0 ? { moedas: increment(moedasRecompensa) } : {}),
      cursosCompletos,
      ...(!moduloJaConcluido
        ? { diasOfensiva, ultimaOfensivaEm: hojeOfensiva }
        : {}),
      atualizadoEm: serverTimestamp(),
    });

    return {
      progresso: novoProgresso,
      recompensaAplicada: !moduloJaConcluido,
    };
  });

  await concluirModuloCursoLocal(uid, curso.id, modulo.id);

  return resultado;
}

export function calcularPorcentagemCurso(
  curso: CursoDetalhado,
  progresso: ProgressoCursoLocal,
): number {
  const totalModulos = listarModulosCurso(curso).length;
  if (totalModulos === 0) return 0;
  return progresso.modulosConcluidos.length / totalModulos;
}

export default function CourseCatalogServiceRoutePlaceholder() {
  return null;
}
