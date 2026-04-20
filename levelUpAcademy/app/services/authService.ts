// =============================================================================
// LEVELUP ACADEMY — authService.ts
// Serviço de autenticação usando Firebase Authentication
// =============================================================================

import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
} from "firebase/auth";
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

// --------------------------------------------------------------------------
// TIPOS
// --------------------------------------------------------------------------

export interface UsuarioFirestore {
  uid: string;
  nome: string;
  email: string;
  nivel: number;
  xpTotal: number;
  moedas: number;
  diasOfensiva: number;
  cursosCompletos: number;
  bio: string;
  fotoUrl: string | null;
  criadoEm: unknown; // Firestore Timestamp
  ultimoLogin: unknown;
}

export interface ResultadoAuth {
  sucesso: boolean;
  mensagem: string;
  usuario?: User;
}

// --------------------------------------------------------------------------
// CADASTRO
// --------------------------------------------------------------------------

export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string,
): Promise<ResultadoAuth> {
  try {
    // 1. Cria o usuário no Firebase Authentication
    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    // 2. Atualiza o displayName no Auth
    await updateProfile(user, { displayName: nome });

    // 3. Cria o documento do usuário no Firestore (coleção "usuarios")
    const dadosIniciais: UsuarioFirestore = {
      uid: user.uid,
      nome,
      email,
      nivel: 1,
      xpTotal: 0,
      moedas: 100, // Bônus inicial
      diasOfensiva: 0,
      cursosCompletos: 0,
      bio: "",
      fotoUrl: null,
      criadoEm: serverTimestamp(),
      ultimoLogin: serverTimestamp(),
    };

    await setDoc(doc(db, "usuarios", user.uid), dadosIniciais);

    return {
      sucesso: true,
      mensagem: "Conta criada com sucesso!",
      usuario: user,
    };
  } catch (error: unknown) {
    const mensagem = traduzirErroFirebase(error);
    return { sucesso: false, mensagem };
  }
}

// --------------------------------------------------------------------------
// LOGIN
// --------------------------------------------------------------------------

export async function logarUsuario(
  email: string,
  senha: string,
): Promise<ResultadoAuth> {
  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    // Atualiza o campo ultimoLogin no Firestore
    await updateDoc(doc(db, "usuarios", user.uid), {
      ultimoLogin: serverTimestamp(),
    });

    return {
      sucesso: true,
      mensagem: "Login realizado com sucesso!",
      usuario: user,
    };
  } catch (error: unknown) {
    const mensagem = traduzirErroFirebase(error);
    return { sucesso: false, mensagem };
  }
}

// --------------------------------------------------------------------------
// LOGOUT
// --------------------------------------------------------------------------

export async function deslogarUsuario(): Promise<void> {
  await signOut(auth);
}

// --------------------------------------------------------------------------
// RECUPERAÇÃO DE SENHA
// --------------------------------------------------------------------------

export async function recuperarSenha(email: string): Promise<ResultadoAuth> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      sucesso: true,
      mensagem:
        "E-mail de recuperação enviado. Verifique sua caixa de entrada.",
    };
  } catch (error: unknown) {
    const mensagem = traduzirErroFirebase(error);
    return { sucesso: false, mensagem };
  }
}

// --------------------------------------------------------------------------
// BUSCAR DADOS DO USUÁRIO NO FIRESTORE
// --------------------------------------------------------------------------

export async function buscarDadosUsuario(
  uid: string,
): Promise<UsuarioFirestore | null> {
  try {
    const snap = await getDoc(doc(db, "usuarios", uid));
    if (snap.exists()) {
      return snap.data() as UsuarioFirestore;
    }
    return null;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// USUÁRIO ATUAL (helper)
// --------------------------------------------------------------------------

export function getUsuarioAtual(): User | null {
  return auth.currentUser;
}

// --------------------------------------------------------------------------
// TRADUÇÃO DE ERROS DO FIREBASE (PT-BR)
// --------------------------------------------------------------------------

function traduzirErroFirebase(error: unknown): string {
  // Firebase lança objetos com a propriedade 'code'
  const code = (error as { code?: string })?.code ?? "";

  const erros: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/user-not-found": "Nenhuma conta encontrada com este e-mail.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Sem conexão com a internet.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
  };

  return erros[code] ?? "Ocorreu um erro inesperado. Tente novamente.";
}
