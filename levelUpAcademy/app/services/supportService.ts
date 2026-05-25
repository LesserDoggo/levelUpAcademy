import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const ADMIN_EMAIL = "lucasbento358@gmail.com";

export type ChamadoStatus = "novo" | "em_andamento" | "respondido" | "fechado";

export interface ChamadoSuporte {
  id: string;
  uid: string;
  nome: string;
  email: string;
  mensagem: string;
  status: ChamadoStatus;
  criadoEm?: unknown;
  atualizadoEm?: unknown;
  ultimaRespostaEm?: unknown;
}

export interface RespostaChamado {
  id: string;
  autorUid: string;
  autorNome: string;
  autorEmail: string;
  autorTipo: "admin" | "usuario";
  mensagem: string;
  criadoEm?: unknown;
}

function timestampMillis(valor: unknown) {
  return ((valor as { seconds?: number })?.seconds ?? 0) * 1000;
}

export function isAdminEmail(email?: string | null) {
  return email?.toLowerCase() === ADMIN_EMAIL;
}

export async function criarChamadoSuporte(params: {
  uid: string;
  nome: string;
  email: string;
  mensagem: string;
}) {
  const ref = await addDoc(collection(db, "chamadosSuporte"), {
    uid: params.uid,
    nome: params.nome,
    email: params.email,
    mensagem: params.mensagem,
    status: "novo",
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  return ref.id;
}

export async function listarMeusChamados(uid: string) {
  const snap = await getDocs(
    query(collection(db, "chamadosSuporte"), where("uid", "==", uid)),
  );
  return snap.docs
    .map((item) => ({ id: item.id, ...item.data() }) as ChamadoSuporte)
    .sort((a, b) => timestampMillis(b.criadoEm) - timestampMillis(a.criadoEm));
}

export async function listarChamadosAdmin(user: User | null) {
  if (!isAdminEmail(user?.email)) return [];
  const snap = await getDocs(query(collection(db, "chamadosSuporte"), orderBy("criadoEm", "desc")));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }) as ChamadoSuporte);
}

export async function listarRespostasChamado(chamadoId: string) {
  const snap = await getDocs(
    query(collection(db, "chamadosSuporte", chamadoId, "respostas"), orderBy("criadoEm", "asc")),
  );
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }) as RespostaChamado);
}

export async function responderChamado(params: {
  chamadoId: string;
  user: User;
  mensagem: string;
  admin: boolean;
}) {
  await addDoc(collection(db, "chamadosSuporte", params.chamadoId, "respostas"), {
    autorUid: params.user.uid,
    autorNome: params.user.displayName ?? (params.admin ? "Suporte LevelUp" : "Usuario"),
    autorEmail: params.user.email ?? "",
    autorTipo: params.admin ? "admin" : "usuario",
    mensagem: params.mensagem,
    criadoEm: serverTimestamp(),
  });

  await updateDoc(doc(db, "chamadosSuporte", params.chamadoId), {
    status: params.admin ? "respondido" : "em_andamento",
    ultimaRespostaEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function atualizarStatusChamado(chamadoId: string, status: ChamadoStatus) {
  await updateDoc(doc(db, "chamadosSuporte", chamadoId), {
    status,
    atualizadoEm: serverTimestamp(),
  });
}

export default function SupportServiceRoutePlaceholder() {
  return null;
}
