// =============================================================================
// LEVELUP ACADEMY — context/AuthContext.tsx
// FIX: na web, o token Firebase demora alguns ms para ser injetado depois que
// onAuthStateChanged dispara. Adicionamos um retry com backoff para aguardar
// o Firestore aceitar a requisição antes de desistir.
// =============================================================================

import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebaseConfig';
import { buscarDadosUsuario, deslogarUsuario, logarComGoogle, logarUsuario, UsuarioFirestore } from '../services/authService';

interface AuthContextType {
    user: User | null;
    dadosUsuario: UsuarioFirestore | null;
    carregando: boolean;
    login: (email: string, senha: string) => Promise<{ sucesso: boolean; mensagem: string }>;
    loginComGoogle: (idToken?: string) => Promise<{ sucesso: boolean; mensagem: string }>;
    logout: () => Promise<void>;
    restoreSession: () => Promise<void>;
    recarregarDados: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    dadosUsuario: null,
    carregando: true,
    login: async () => ({ sucesso: false, mensagem: 'AuthContext não inicializado' }),
    loginComGoogle: async () => ({ sucesso: false, mensagem: 'AuthContext não inicializado' }),
    logout: async () => { },
    restoreSession: async () => { },
    recarregarDados: async () => { },
});

// Aguarda N ms — usado para dar tempo ao token Firebase de propagar na web
function esperar(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tenta buscar os dados do usuário com até 3 tentativas (backoff: 300ms, 800ms)
// Necessário na web porque o token JWT leva alguns ms para ser injetado
// no SDK do Firestore após o onAuthStateChanged disparar.
async function buscarComRetry(uid: string): Promise<UsuarioFirestore | null> {
    const tentativas = [0, 300, 800]; // delays antes de cada tentativa
    for (const delay of tentativas) {
        if (delay > 0) await esperar(delay);
        try {
            const dados = await buscarDadosUsuario(uid);
            return dados;
        } catch (err: any) {
            const isPermissao =
                err?.code === 'permission-denied' ||
                err?.message?.includes('Missing or insufficient permissions');
            if (!isPermissao) throw err; // erro diferente → não tenta de novo
            // se for permissão, aguarda e tenta novamente
        }
    }
    // Última tentativa sem capturar — deixa falhar naturalmente
    return await buscarDadosUsuario(uid);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dadosUsuario, setDadosUsuario] = useState<UsuarioFirestore | null>(null);
    const [carregando, setCarregando] = useState(true);

    async function recarregarDados() {
        if (user) {
            try {
                const dados = await buscarComRetry(user.uid);
                setDadosUsuario(dados);
            } catch (error) {
                console.warn('recarregarDados: erro ao buscar Firestore:', error);
            }
        }
    }

    async function restoreSession() {
        if (auth.currentUser) {
            const dados = await buscarComRetry(auth.currentUser.uid);
            setDadosUsuario(dados);
            setUser(auth.currentUser);
        }
    }

    async function login(email: string, senha: string) {
        const resultado = await logarUsuario(email, senha);
        return { sucesso: resultado.sucesso, mensagem: resultado.mensagem };
    }

    async function loginComGoogle(idToken?: string) {
        const resultado = await logarComGoogle(idToken);
        return { sucesso: resultado.sucesso, mensagem: resultado.mensagem };
    }

    async function logout() {
        await deslogarUsuario();
        setDadosUsuario(null);
        setUser(null);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Força o refresh do token antes de qualquer leitura no Firestore.
                    // Isso garante que o SDK Web já tem o Bearer token atualizado.
                    await firebaseUser.getIdToken(true);

                    const dados = await buscarComRetry(firebaseUser.uid);
                    setDadosUsuario(dados);
                } catch (error) {
                    console.warn('AuthContext: não foi possível buscar dados do usuário:', error);
                    setDadosUsuario(null);
                }
            } else {
                setDadosUsuario(null);
            }

            // CRÍTICO: setCarregando(false) só é chamado aqui, após tudo resolver.
            // O AuthGuard no _layout.tsx depende disso para não redirecionar cedo.
            setCarregando(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, dadosUsuario, carregando, login, loginComGoogle, logout, restoreSession, recarregarDados }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthContextRoutePlaceholder() {
    return null;
}
