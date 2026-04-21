import { Platform } from "react-native";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
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
  notificacoes?: {
    canal: "email" | "push";
    frequencia: "diaria" | "semanal" | "mensal";
    habilitado: boolean;
  };
  criadoEm: unknown;
  ultimoLogin: unknown;
}

export interface ResultadoAuth {
  sucesso: boolean;
  mensagem: string;
  usuario?: User;
}

function validarSenhaForte(senha: string): string | null {
  if (senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
  if (!/[A-Z]/.test(senha)) return "A senha deve ter ao menos 1 letra maiuscula.";
  if (!/[0-9]/.test(senha)) return "A senha deve ter ao menos 1 numero.";
  if (!/[!@#$%^&*(),.?\":{}|<>_\-\\/\[\];'+=~`]/.test(senha)) {
    return "A senha deve ter ao menos 1 caractere especial.";
  }
  return null;
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ehErroPermissaoFirestore(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  const message = (error as { message?: string })?.message ?? "";

  return (
    code === "permission-denied" ||
    message.includes("Missing or insufficient permissions")
  );
}

async function executarComRetryFirestore<T>(operacao: () => Promise<T>) {
  const tentativas = Platform.OS === "web" ? [0, 300, 800] : [0];

  for (let i = 0; i < tentativas.length; i += 1) {
    const delay = tentativas[i];

    if (delay > 0) {
      await esperar(delay);
    }

    try {
      return await operacao();
    } catch (error) {
      const ultimaTentativa = i === tentativas.length - 1;

      if (ultimaTentativa || !ehErroPermissaoFirestore(error)) {
        throw error;
      }
    }
  }

  return await operacao();
}

function montarDadosIniciaisUsuario(
  user: User,
  nomeSobrescrito?: string,
): UsuarioFirestore {
  return {
    uid: user.uid,
    nome: nomeSobrescrito ?? user.displayName ?? "Usuario",
    email: user.email ?? "",
    nivel: 1,
    xpTotal: 0,
    moedas: 100,
    diasOfensiva: 0,
    cursosCompletos: 0,
    bio: "",
    fotoUrl: user.photoURL ?? null,
    notificacoes: {
      canal: "email",
      frequencia: "semanal",
      habilitado: true,
    },
    criadoEm: serverTimestamp(),
    ultimoLogin: serverTimestamp(),
  };
}

async function sincronizarUsuarioFirestore(user: User) {
  const ref = doc(db, "usuarios", user.uid);
  const snap = await executarComRetryFirestore(() => getDoc(ref));

  if (!snap.exists()) {
    await executarComRetryFirestore(() => setDoc(ref, montarDadosIniciaisUsuario(user)));
    return;
  }

  const dadosAtuais = snap.data() as Partial<UsuarioFirestore>;

  await executarComRetryFirestore(() =>
    updateDoc(ref, {
      nome: user.displayName ?? dadosAtuais.nome ?? "Usuario",
      email: user.email ?? dadosAtuais.email ?? "",
      fotoUrl: user.photoURL ?? dadosAtuais.fotoUrl ?? null,
      ultimoLogin: serverTimestamp(),
    }),
  );
}

export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string,
): Promise<ResultadoAuth> {
  try {
    const erroSenha = validarSenhaForte(senha);
    if (erroSenha) {
      return {
        sucesso: false,
        mensagem: erroSenha,
      };
    }

    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    await updateProfile(user, { displayName: nome });
    await executarComRetryFirestore(() =>
      setDoc(doc(db, "usuarios", user.uid), montarDadosIniciaisUsuario(user, nome)),
    );

    return {
      sucesso: true,
      mensagem: "Conta criada com sucesso!",
      usuario: user,
    };
  } catch (error: unknown) {
    return { sucesso: false, mensagem: traduzirErroFirebase(error) };
  }
}

export async function logarUsuario(
  email: string,
  senha: string,
): Promise<ResultadoAuth> {
  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    await updateDoc(doc(db, "usuarios", user.uid), {
      ultimoLogin: serverTimestamp(),
    });

    return {
      sucesso: true,
      mensagem: "Login realizado com sucesso!",
      usuario: user,
    };
  } catch (error: unknown) {
    return { sucesso: false, mensagem: traduzirErroFirebase(error) };
  }
}

export async function logarComGoogle(idToken?: string): Promise<ResultadoAuth> {
  try {
    let user: User;

    if (idToken) {
      const credential = GoogleAuthProvider.credential(idToken);
      const resultado = await signInWithCredential(auth, credential);
      user = resultado.user;
    } else if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const resultado = await signInWithPopup(auth, provider);
      user = resultado.user;
    } else {
      return {
        sucesso: false,
        mensagem: "Token do Google nao recebido no dispositivo.",
      };
    }

    await sincronizarUsuarioFirestore(user);

    return {
      sucesso: true,
      mensagem: "Login com Google realizado com sucesso!",
      usuario: user,
    };
  } catch (error: unknown) {
    return { sucesso: false, mensagem: traduzirErroFirebase(error) };
  }
}

export async function iniciarLoginComGoogleWeb(): Promise<ResultadoAuth | null> {
  if (Platform.OS !== "web") {
    throw new Error("Fluxo de redirecionamento do Google disponivel apenas na web.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const resultado = await signInWithPopup(auth, provider);
    await sincronizarUsuarioFirestore(resultado.user);

    return {
      sucesso: true,
      mensagem: "Login com Google realizado com sucesso!",
      usuario: resultado.user,
    };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code ?? "";

    if (
      code === "auth/popup-blocked" ||
      code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw error;
  }
}

export async function concluirLoginComGoogleWeb(): Promise<ResultadoAuth | null> {
  if (Platform.OS !== "web") {
    return null;
  }

  try {
    const resultado = await getRedirectResult(auth);

    if (!resultado?.user) {
      return null;
    }

    await sincronizarUsuarioFirestore(resultado.user);

    return {
      sucesso: true,
      mensagem: "Login com Google realizado com sucesso!",
      usuario: resultado.user,
    };
  } catch (error: unknown) {
    return {
      sucesso: false,
      mensagem: traduzirErroFirebase(error),
    };
  }
}

export async function deslogarUsuario(): Promise<void> {
  await signOut(auth);
}

export async function recuperarSenha(email: string): Promise<ResultadoAuth> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      sucesso: true,
      mensagem: "E-mail de recuperacao enviado. Verifique sua caixa de entrada.",
    };
  } catch (error: unknown) {
    return { sucesso: false, mensagem: traduzirErroFirebase(error) };
  }
}

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

export function getUsuarioAtual(): User | null {
  return auth.currentUser;
}

function traduzirErroFirebase(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";

  const erros: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail ja esta cadastrado.",
    "auth/invalid-email": "E-mail invalido.",
    "auth/weak-password": "A senha deve ter 6+ caracteres, 1 letra maiuscula, 1 numero e 1 caractere especial.",
    "auth/password-does-not-meet-requirements":
      "A senha deve ter 6+ caracteres, 1 letra maiuscula, 1 numero e 1 caractere especial.",
    "auth/user-not-found": "Nenhuma conta encontrada com este e-mail.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Sem conexao com a internet.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/operation-not-allowed":
      "Login com Google nao habilitado no Firebase Authentication.",
    "auth/popup-closed-by-user": "Login cancelado pelo usuario.",
    "auth/popup-blocked": "O navegador bloqueou o popup de login do Google.",
    "auth/unauthorized-domain":
      "Este dominio ainda nao foi autorizado no Firebase Authentication.",
  };

  return erros[code] ?? "Ocorreu um erro inesperado. Tente novamente.";
}

export default function AuthServiceRoutePlaceholder() {
  return null;
}
