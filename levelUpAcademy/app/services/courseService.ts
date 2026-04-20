// =============================================================================
// LEVELUP ACADEMY — courseService.ts
// Serviço de cursos com Firebase Firestore (substitui os mocks)
// Inclui o conteúdo da Fase 2 do PDF (Controle de Acesso e Configurações)
// =============================================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// --------------------------------------------------------------------------
// INTERFACES / TIPOS
// --------------------------------------------------------------------------

export interface CursoProgresso {
  id: string;
  titulo: string;
  aulaAtual: string;
  porcentagem: number; // 0 a 1
}

export interface Atividade {
  id: string;
  titulo: string;
  tipo: "multipla_escolha" | "verdadeiro_falso" | "dissertativa";
  enunciado: string;
  opcoes?: string[]; // Para múltipla escolha
  respostaCorreta?: string; // Índice (para MC) ou 'V'/'F'
  xpRecompensa: number;
}

export interface Licao {
  id: string;
  titulo: string;
  descricao: string;
  conteudo: string; // Texto da lição (Markdown ou HTML)
  duracaoEstimadaMin: number;
  xpRecompensa: number;
  atividades: Atividade[];
}

export interface Unidade {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  licoes: Licao[];
}

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  nivel: "Iniciante" | "Intermediário" | "Avançado";
  aulas: number;
  xpTotal: number;
  unidades: Unidade[];
  criadoEm?: unknown;
}

export interface ProgressoCurso {
  uid: string;
  cursoId: string;
  licoesConcluidas: string[];
  atividadesConcluidas: string[];
  porcentagem: number;
  xpGanho: number;
  ultimaLicaoId: string | null;
  iniciadoEm: unknown;
  atualizadoEm: unknown;
}

// --------------------------------------------------------------------------
// SEED: CURSO BASEADO NO PDF — "Desenvolvimento de Sistemas — Fase 2"
// Conteúdo programático extraído do PDF da Etapa 4, Fase 2
// --------------------------------------------------------------------------

export const CURSO_ETAPA4_SEED: Curso = {
  id: "ads-etapa4-fase2",
  titulo: "Desenvolvimento de Sistemas — Fase 2",
  descricao:
    "Implemente controle de acesso e gerenciamento de configurações seguindo os requisitos da Etapa 4 do Projeto de Startups. Aprenda autenticação segura, LGPD e boas práticas de engenharia de software.",
  categoria: "ADS",
  nivel: "Intermediário",
  aulas: 14,
  xpTotal: 1400,
  unidades: [
    // ------------------------------------------------------------------
    // UNIDADE 1 — Controle de Acesso
    // ------------------------------------------------------------------
    {
      id: "u1-controle-acesso",
      titulo: "Unidade 1 — Controle de Acesso",
      descricao: "Implemente os mecanismos de autenticação do sistema.",
      ordem: 1,
      licoes: [
        {
          id: "l1-splash",
          titulo: "Tela de Splash (Carregamento Inicial)",
          descricao:
            "Aprenda a criar e configurar a tela de splash do aplicativo.",
          conteudo: `# Tela de Splash

A **tela de splash** é exibida durante o carregamento inicial da aplicação, proporcionando uma transição suave enquanto os recursos do sistema são carregados em segundo plano.

## Função
- **Estética**: reforça a identidade da startup (logo, slogan, cores da marca).
- **Funcional**: indica ao usuário que o sistema está iniciando corretamente.

## Implementação com Expo
\`\`\`bash
npx expo install expo-splash-screen
\`\`\`

No arquivo \`app/_layout.tsx\`:
\`\`\`typescript
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync(); // Mantém visível
// ... após carregar fontes/dados:
SplashScreen.hideAsync();
\`\`\`

## Boas Práticas
- Mantenha a splash simples: logo + fundo.
- Não bloqueie o usuário por mais de 2 segundos.
- Use cores consistentes com o tema do app.
`,
          duracaoEstimadaMin: 15,
          xpRecompensa: 100,
          atividades: [
            {
              id: "a1-splash-1",
              titulo: "Função da Tela de Splash",
              tipo: "multipla_escolha",
              enunciado:
                "Qual é a principal função FUNCIONAL de uma tela de splash?",
              opcoes: [
                "Apenas exibir o logo da empresa",
                "Indicar ao usuário que o sistema está iniciando corretamente enquanto carrega recursos",
                "Fazer autenticação do usuário",
                "Exibir anúncios",
              ],
              respostaCorreta: "1",
              xpRecompensa: 50,
            },
            {
              id: "a1-splash-2",
              titulo: "Tempo máximo de Splash",
              tipo: "verdadeiro_falso",
              enunciado:
                "Uma boa prática é manter a tela de splash visível por mais de 5 segundos para o usuário apreciar o design.",
              respostaCorreta: "F",
              xpRecompensa: 50,
            },
          ],
        },
        {
          id: "l2-login",
          titulo: "Tela de Login e Cadastro de Usuário",
          descricao:
            "Implemente a autenticação tradicional com email e senha usando Firebase.",
          conteudo: `# Login e Cadastro de Usuário

Essa tela permite que novos usuários se registrem e usuários existentes acessem a plataforma de forma segura.

## Fluxo
1. **Cadastro** → coleta nome, e-mail e senha → cria conta no Firebase Auth → salva perfil no Firestore.
2. **Login** → autentica via e-mail/senha → redireciona para Home.
3. **Recuperação de senha** → envia e-mail de redefinição via Firebase.

## Regras de Senha (Política)
- Mínimo de 6 caracteres (exigido pelo Firebase).
- Recomendado: ao menos 1 letra maiúscula, 1 número e 1 caractere especial.

## Armazenamento Seguro (Hash)
O Firebase Authentication armazena senhas usando **bcrypt** automaticamente — você nunca manipula a senha em texto puro no Firestore.

## Autenticação Alternativa (API)
O Google Sign-In pode ser integrado via \`@react-native-google-signin/google-signin\`:
\`\`\`typescript
GoogleSignIn.configure({ webClientId: 'SEU_WEB_CLIENT_ID' });
const { idToken } = await GoogleSignIn.signIn();
const credential = GoogleAuthProvider.credential(idToken);
await signInWithCredential(auth, credential);
\`\`\`
`,
          duracaoEstimadaMin: 30,
          xpRecompensa: 150,
          atividades: [
            {
              id: "a2-login-1",
              titulo: "Armazenamento Seguro de Senhas",
              tipo: "multipla_escolha",
              enunciado:
                "Como o Firebase Authentication armazena as senhas dos usuários?",
              opcoes: [
                "Em texto puro no Firestore",
                "Criptografadas com bcrypt (hash)",
                "Codificadas em Base64",
                "Não armazena, apenas valida online",
              ],
              respostaCorreta: "1",
              xpRecompensa: 75,
            },
            {
              id: "a2-login-2",
              titulo: "Autenticação Alternativa",
              tipo: "verdadeiro_falso",
              enunciado:
                "O método de autenticação alternativo (ex: Google Sign-In) é um requisito obrigatório do projeto conforme o PDF da Fase 2.",
              respostaCorreta: "V",
              xpRecompensa: 75,
            },
          ],
        },
        {
          id: "l3-recuperacao",
          titulo: "Recuperação de Senha",
          descricao:
            "Implemente o fluxo seguro de redefinição de senha via e-mail.",
          conteudo: `# Recuperação de Senha

O sistema deve oferecer um mecanismo **seguro** para que o usuário redefina suas credenciais.

## Método via E-mail (Firebase)
\`\`\`typescript
import { sendPasswordResetEmail } from 'firebase/auth';

await sendPasswordResetEmail(auth, email);
// Firebase envia um link seguro para o e-mail cadastrado
\`\`\`

## Fluxo da Tela
1. Usuário informa o e-mail.
2. App chama \`sendPasswordResetEmail\`.
3. Firebase envia link de redefinição.
4. Usuário clica no link, redefine a senha.
5. Retorna para o Login.

## Outros métodos possíveis
- **Token temporário**: gerar um código de 6 dígitos com validade de 10 min.
- **Biometria**: usando \`expo-local-authentication\`.

## Validações obrigatórias
- Verificar se o e-mail tem formato válido antes de enviar.
- Exibir mensagem de sucesso mesmo se o e-mail não existir (segurança contra enumeração).
`,
          duracaoEstimadaMin: 20,
          xpRecompensa: 100,
          atividades: [
            {
              id: "a3-rec-1",
              titulo: "Segurança na Recuperação",
              tipo: "multipla_escolha",
              enunciado:
                'Por que exibir "e-mail enviado" mesmo quando o endereço não está cadastrado é uma boa prática de segurança?',
              opcoes: [
                "Para não confundir o usuário",
                "Para evitar que atacantes descubram quais e-mails estão cadastrados no sistema (enumeração)",
                "Porque o Firebase exige isso",
                "Para melhorar a UX",
              ],
              respostaCorreta: "1",
              xpRecompensa: 100,
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------
    // UNIDADE 2 — Configuração do Sistema (Perfil)
    // ------------------------------------------------------------------
    {
      id: "u2-configuracao",
      titulo: "Unidade 2 — Configuração do Sistema",
      descricao:
        "Implemente o gerenciamento de conta e preferências do usuário.",
      ordem: 2,
      licoes: [
        {
          id: "l4-perfil",
          titulo: "Minha Conta (Perfil)",
          descricao:
            "Implemente visualização e edição dos dados do perfil no Firestore.",
          conteudo: `# Minha Conta — Perfil do Usuário

## Funcionalidades obrigatórias (Fase 2)
- ✅ Visualizar dados pessoais cadastrados.
- ✅ Atualizar nome e bio (exceto CPF e e-mail — dados críticos).
- ✅ Cadastrar foto de perfil e/ou plano de fundo.
- ✅ Gerenciar notificações (canal e frequência).

## Leitura do perfil (Firestore)
\`\`\`typescript
const snap = await getDoc(doc(db, 'usuarios', uid));
const dados = snap.data() as UsuarioFirestore;
\`\`\`

## Atualização parcial
\`\`\`typescript
await updateDoc(doc(db, 'usuarios', uid), {
  nome: novoNome,
  bio: novaBio,
  fotoUrl: urlDaFoto,
  atualizadoEm: serverTimestamp(),
});
\`\`\`

## Upload de foto (Firebase Storage)
\`\`\`typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const fotoRef = ref(storage, \`fotos/\${uid}.jpg\`);
await uploadBytes(fotoRef, blobDaFoto);
const url = await getDownloadURL(fotoRef);
\`\`\`

## Campos editáveis vs. bloqueados
| Campo | Editável? |
|-------|-----------|
| Nome | ✅ Sim |
| Bio | ✅ Sim |
| Foto | ✅ Sim |
| E-mail | ❌ Não (dado crítico) |
| CPF | ❌ Não (dado crítico) |
`,
          duracaoEstimadaMin: 25,
          xpRecompensa: 150,
          atividades: [
            {
              id: "a4-perfil-1",
              titulo: "Dados críticos",
              tipo: "verdadeiro_falso",
              enunciado:
                "Segundo os requisitos da Fase 2, o usuário pode alterar o seu e-mail pela tela de perfil.",
              respostaCorreta: "F",
              xpRecompensa: 75,
            },
          ],
        },
        {
          id: "l5-seguranca",
          titulo: "Segurança, Acesso e Suporte",
          descricao:
            "Implemente política de senha, FAQ, Fale Conosco e exclusão de conta.",
          conteudo: `# Segurança, Acesso e Suporte

## Política de Senha
Exiba as regras de criação de senha de forma clara na UI:
- Mínimo de 6 caracteres
- Ao menos 1 letra maiúscula
- Ao menos 1 número
- Ao menos 1 caractere especial

## Alteração de Senha
\`\`\`typescript
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

// Reautenticar antes de alterar
const cred = EmailAuthProvider.credential(user.email!, senhaAtual);
await reauthenticateWithCredential(user, cred);

// Alterar
await updatePassword(user, novaSenha);
\`\`\`

## Ajuda e Suporte
- **Fale Conosco**: link para WhatsApp, e-mail ou chat.
- **FAQ**: lista de perguntas frequentes.
- **Sobre o sistema**: nome, versão, desenvolvedor.
- **Avaliação**: modelo de 5 estrelas com comentário → salvar no Firestore na coleção \`avaliacoes\`.

## Exclusão de Conta
1. Exibir política de permanência (benefícios de manter a conta).
2. Solicitar confirmação segura (senha ou token enviado por e-mail).
3. Deletar dados no Firestore → deletar conta no Auth.

\`\`\`typescript
import { deleteUser } from 'firebase/auth';
import { deleteDoc } from 'firebase/firestore';

await deleteDoc(doc(db, 'usuarios', uid));
await deleteUser(auth.currentUser!);
\`\`\`
`,
          duracaoEstimadaMin: 30,
          xpRecompensa: 150,
          atividades: [
            {
              id: "a5-seg-1",
              titulo: "Reautenticação",
              tipo: "multipla_escolha",
              enunciado:
                "Por que é necessário reautenticar o usuário antes de alterar a senha?",
              opcoes: [
                "Requisito burocrático do Firebase",
                "Para garantir que é o dono da conta realizando a operação sensível, evitando ataques de sequestro de sessão",
                "Para atualizar o token JWT",
                "Não é necessário reautenticar",
              ],
              respostaCorreta: "1",
              xpRecompensa: 100,
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------
    // UNIDADE 3 — Conformidade e LGPD
    // ------------------------------------------------------------------
    {
      id: "u3-lgpd",
      titulo: "Unidade 3 — Conformidade e LGPD",
      descricao:
        "Entenda e implemente os requisitos legais de proteção de dados.",
      ordem: 3,
      licoes: [
        {
          id: "l6-lgpd",
          titulo: "LGPD e Conformidade de Software",
          descricao:
            "Aprenda os requisitos da Lei Geral de Proteção de Dados aplicados ao projeto.",
          conteudo: `# LGPD e Conformidade de Software

## O que é conformidade de software?
Conformidade é o alinhamento com normas **legais, regulatórias e éticas**, essencial para:
- Garantir segurança, privacidade e qualidade do sistema.
- Atender legislações e padrões da indústria.
- Proteger dados sensíveis dos usuários.
- Assegurar credibilidade e confiabilidade da solução.

## Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)
A LGPD regula o tratamento de dados pessoais de pessoas físicas no Brasil.

### Princípios fundamentais
| Princípio | O que significa |
|-----------|----------------|
| Finalidade | Dados coletados com propósito específico e legítimo |
| Necessidade | Coletar apenas o mínimo necessário |
| Transparência | Informar claramente como os dados são usados |
| Segurança | Proteger os dados contra acessos não autorizados |

## O que implementar no LevelUp Academy
- **Política de Privacidade**: tela interna ou link para documento externo.
- **Termos de Uso**: aceite obrigatório no cadastro.
- **Consentimento**: checkbox explícito antes de coletar dados.
- **Direito ao esquecimento**: função de exclusão de conta e dados.

## No Firestore: Regras de Segurança
\`\`\`js
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /cursos/{cursoId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas via Admin SDK
    }
  }
}
\`\`\`
`,
          duracaoEstimadaMin: 25,
          xpRecompensa: 200,
          atividades: [
            {
              id: "a6-lgpd-1",
              titulo: "Princípio da Necessidade",
              tipo: "multipla_escolha",
              enunciado: 'O princípio da "Necessidade" na LGPD significa:',
              opcoes: [
                "O sistema precisa funcionar 24h por dia",
                "Coletar apenas os dados mínimos necessários para a finalidade declarada",
                "O usuário pode acessar o sistema sempre que necessário",
                "A empresa precisa armazenar todos os dados por 5 anos",
              ],
              respostaCorreta: "1",
              xpRecompensa: 100,
            },
            {
              id: "a6-lgpd-2",
              titulo: "Direito ao Esquecimento",
              tipo: "verdadeiro_falso",
              enunciado:
                "A função de exclusão de conta do LevelUp Academy é um requisito tanto do PDF da Fase 2 quanto da LGPD (direito ao esquecimento).",
              respostaCorreta: "V",
              xpRecompensa: 100,
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------------
    // UNIDADE 4 — Boas Práticas de Desenvolvimento
    // ------------------------------------------------------------------
    {
      id: "u4-boas-praticas",
      titulo: "Unidade 4 — Boas Práticas de Desenvolvimento",
      descricao: "Aplique boas práticas de engenharia de software no projeto.",
      ordem: 4,
      licoes: [
        {
          id: "l7-git",
          titulo: "Controle de Versão com Git",
          descricao:
            "Configure e use Git e GitHub para gerenciar o código do projeto.",
          conteudo: `# Controle de Versão com Git

## Por que usar Git?
- Rastreia todas as alterações no código.
- Permite colaboração entre membros do grupo.
- Possibilita reverter erros.
- Exigido como boa prática na Fase 2 do projeto.

## Comandos essenciais
\`\`\`bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "feat: implementa tela de login com Firebase"

# Enviar para o GitHub
git push origin main
\`\`\`

## Padrão de commits (Conventional Commits)
- \`feat:\` nova funcionalidade
- \`fix:\` correção de bug
- \`docs:\` documentação
- \`refactor:\` refatoração sem nova funcionalidade
- \`style:\` formatação de código

## .gitignore para o projeto
\`\`\`gitignore
node_modules/
.env
*.env.local
config/firebaseConfig.ts   # NUNCA commitar credenciais!
\`\`\`

> ⚠️ **Importante**: nunca versione arquivos com API Keys do Firebase. Use variáveis de ambiente.
`,
          duracaoEstimadaMin: 20,
          xpRecompensa: 100,
          atividades: [
            {
              id: "a7-git-1",
              titulo: "Segurança com Git",
              tipo: "verdadeiro_falso",
              enunciado:
                "É seguro versionar o arquivo firebaseConfig.ts (com API Keys) em um repositório público no GitHub.",
              respostaCorreta: "F",
              xpRecompensa: 100,
            },
          ],
        },
        {
          id: "l8-validacoes",
          titulo: "Validações e Tratamento de Erros",
          descricao:
            "Implemente validações no frontend e backend e exiba mensagens claras ao usuário.",
          conteudo: `# Validações e Tratamento de Erros

## Regra de ouro
> Valide no **frontend** para UX. Valide no **backend** (Firestore Rules + Firebase Auth) para segurança.

## Validações no Frontend (React Native)

\`\`\`typescript
function validarEmail(email: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function validarSenha(senha: string): string | null {
  if (senha.length < 6) return 'Mínimo de 6 caracteres';
  if (!/[A-Z]/.test(senha)) return 'Inclua ao menos uma letra maiúscula';
  if (!/[0-9]/.test(senha)) return 'Inclua ao menos um número';
  return null; // null = válida
}
\`\`\`

## Feedback ao usuário
- Use \`Alert.alert\` para mensagens críticas.
- Use texto vermelho abaixo dos inputs para erros de validação.
- Mostre \`ActivityIndicator\` durante chamadas assíncronas ao Firebase.

## Tratamento de erros do Firebase
O \`authService.ts\` já inclui a função \`traduzirErroFirebase\` que converte códigos técnicos em mensagens amigáveis em PT-BR.
`,
          duracaoEstimadaMin: 20,
          xpRecompensa: 100,
          atividades: [
            {
              id: "a8-val-1",
              titulo: "Estratégia de validação",
              tipo: "multipla_escolha",
              enunciado:
                "Qual afirmação descreve corretamente a estratégia de validação?",
              opcoes: [
                "Validar apenas no frontend é suficiente para garantir segurança",
                "Validar apenas no backend é suficiente",
                "Validar no frontend (UX) E no backend/Firestore Rules (segurança)",
                "Não é necessário validar em apps mobile",
              ],
              respostaCorreta: "2",
              xpRecompensa: 100,
            },
          ],
        },
      ],
    },
  ],
};

// --------------------------------------------------------------------------
// FUNÇÕES DE SERVIÇO (Firebase Firestore)
// --------------------------------------------------------------------------

/** Retorna todos os cursos disponíveis */
export async function listarCursos(): Promise<Curso[]> {
  const snap = await getDocs(
    query(collection(db, "cursos"), orderBy("titulo")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Curso);
}

/** Retorna um curso específico pelo ID */
export async function buscarCurso(cursoId: string): Promise<Curso | null> {
  const snap = await getDoc(doc(db, "cursos", cursoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Curso;
}

/** Retorna o progresso de um usuário em todos os seus cursos */
export async function buscarProgressoUsuario(
  uid: string,
): Promise<ProgressoCurso[]> {
  const snap = await getDocs(
    query(collection(db, "progresso"), where("uid", "==", uid)),
  );
  return snap.docs.map((d) => d.data() as ProgressoCurso);
}

/** Retorna o progresso de um usuário em um curso específico */
export async function buscarProgressoCurso(
  uid: string,
  cursoId: string,
): Promise<ProgressoCurso | null> {
  const id = `${uid}_${cursoId}`;
  const snap = await getDoc(doc(db, "progresso", id));
  if (!snap.exists()) return null;
  return snap.data() as ProgressoCurso;
}

/** Retorna o curso que o usuário está estudando no momento (maior atividade recente) */
export async function getCursoAtual(
  uid: string,
): Promise<CursoProgresso | null> {
  const progressos = await buscarProgressoUsuario(uid);
  if (progressos.length === 0) return null;

  // Ordena por data de atualização
  const progresso = progressos.sort((a, b) => {
    const aTime = (a.atualizadoEm as { seconds: number })?.seconds ?? 0;
    const bTime = (b.atualizadoEm as { seconds: number })?.seconds ?? 0;
    return bTime - aTime;
  })[0];

  const curso = await buscarCurso(progresso.cursoId);
  if (!curso) return null;

  // Encontra o título da lição atual
  let aulaAtual = "Iniciando...";
  if (progresso.ultimaLicaoId) {
    for (const unidade of curso.unidades) {
      const licao = unidade.licoes.find(
        (l) => l.id === progresso.ultimaLicaoId,
      );
      if (licao) {
        aulaAtual = licao.titulo;
        break;
      }
    }
  }

  return {
    id: curso.id,
    titulo: curso.titulo,
    aulaAtual,
    porcentagem: progresso.porcentagem,
  };
}

/** Marca uma lição como concluída e atualiza o progresso */
export async function concluirLicao(
  uid: string,
  cursoId: string,
  licaoId: string,
  xpGanho: number,
  totalLicoes: number,
): Promise<void> {
  const progressoId = `${uid}_${cursoId}`;
  const ref = doc(db, "progresso", progressoId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Cria o documento de progresso
    const novoProgresso: ProgressoCurso = {
      uid,
      cursoId,
      licoesConcluidas: [licaoId],
      atividadesConcluidas: [],
      porcentagem: 1 / totalLicoes,
      xpGanho,
      ultimaLicaoId: licaoId,
      iniciadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    };
    await setDoc(ref, novoProgresso);
  } else {
    const progresso = snap.data() as ProgressoCurso;
    const novaLista = [...new Set([...progresso.licoesConcluidas, licaoId])];
    const novaPct = novaLista.length / totalLicoes;

    await updateDoc(ref, {
      licoesConcluidas: novaLista,
      porcentagem: novaPct,
      xpGanho: progresso.xpGanho + xpGanho,
      ultimaLicaoId: licaoId,
      atualizadoEm: serverTimestamp(),
    });
  }

  // Atualiza o XP total do usuário
  await updateDoc(doc(db, "usuarios", uid), {
    xpTotal: xpGanho, // use increment() do Firestore para somar
    atualizadoEm: serverTimestamp(),
  });
}

/** Helper: retorna cor da barra de progresso */
export function getCorBarra(pct: number): string {
  if (pct < 0.27) return "#390b3b";
  if (pct < 0.7) return "#7c1272";
  return "#880ca7";
}

// --------------------------------------------------------------------------
// SEED: popula o Firestore com o curso do PDF (rodar uma vez)
// --------------------------------------------------------------------------

export async function seedCursoPDF(): Promise<void> {
  const ref = doc(db, "cursos", CURSO_ETAPA4_SEED.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...CURSO_ETAPA4_SEED, criadoEm: serverTimestamp() });
    console.log("✅ Curso da Fase 2 adicionado ao Firestore!");
  } else {
    console.log("ℹ️ Curso da Fase 2 já existe no Firestore.");
  }
}

export default function CourseServiceRoutePlaceholder() {
  return null;
}
