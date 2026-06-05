import { CursoDetalhado } from "@/types/course";

const textoParaPreencher = `
TODO: substitua este texto pelo conteudo do modulo.

Sugestao de estrutura:
- Objetivo do modulo
- Conceitos principais
- Exemplo guiado
- Pontos importantes para revisar
`;

const imagemParaPreencher = [
  {
    url: "https://placehold.co/900x500/212636/bfc0d1.png?text=Imagem+do+conteudo",
    descricao: "TODO: substitua por uma imagem do conteudo.",
  },
];

const videoKhanParaPreencher = {
  descricao:
    "TODO: coloque aqui a descricao do video da Khan Academy e o que o aluno deve observar.",
  url: "https://pt.khanacademy.org/computing/computer-programming",
  embedUrl: "https://pt.khanacademy.org/computing/computer-programming",
  provedor: "khan_academy" as const,
};

const quizParaPreencher = [
  {
    id: "q1",
    enunciado: "TODO: escreva aqui a pergunta do quiz.",
    opcoes: [
      "TODO: opcao correta ou incorreta",
      "TODO: outra opcao",
      "TODO: outra opcao",
      "TODO: outra opcao",
    ],
    respostaCorretaIndex: 0,
    explicacao: "TODO: explique por que essa resposta esta correta.",
  },
];

export const cursoProgramacaoJavascriptWeb: CursoDetalhado = {
  id: "programacao-computadores-javascript-web",
  titulo: "Programação de computadores - JavaScript e a Web (KHAN ACADEMY)",
  descricao:
    "Curso introdutorio para aprender programacao usando JavaScript, HTML, CSS e projetos interativos para a web.",
  categoria: ["Programação", "JavaScript", "Web", "KHAN ACADEMY"],
  nivel: "Iniciante",
  unidades: [
    {
      id: "u1-introducao",
      titulo: "Unidade 1: Introdução a JavaScript: Desenho & Animação",
      descricao:
        "Você já se perguntou o que é preciso para fazer desenhos animados? Bem, nós temos que falar com nosso computador numa língua especial. Nesta unidade, aprenderemos a usar a linguagem de programação JavaScript e a biblioteca JavaScript Processing para fazer nossos próprios desenhos e animações.",
      ordem: 1,
      modulos: [
        {
          id: "m1-introducao-a-programacao",
          titulo: "Introdução à programação",
          descricao:
            "Se você é novo aqui, assista ao nosso vídeo de introdução e faça um breve tour pelo nosso curso de programação. Então, comece a programar!.",
          duracaoEstimadaMin: 7,
          xpRecompensa: 100,
          partes: [
            {
              id: "p1-video",
              tipo: "video",
              titulo: "Conceitos iniciais",
              descricao:
                "Programação é o processo de criação de um conjunto de instruções que dizem ao computador como realizar uma tarefa. Podemos programar usando uma variedade de linguagens de programação de computadores, como JavaScript, Python e C++.  Esses programas podem ser aplicados a problemas como controlar robôs enviados a Marte, processar dados médicos, para produzir efeitos especiais em filmes. Aprender JavaScript na Khan Academy é um ótimo ponto de partida, pois os conceitos básicos se aplicam a diferentes linguagens de programação!\n\n- Versão original criada por Pamela Fox.",
              url: "https://youtu.be/ZYuqrJ7M4qY",
              embedUrl:
                '<iframe width="750" height="422" src="https://www.youtube.com/embed/ZYuqrJ7M4qY" title="Seja bem-vindo à programação | Introdução JS:Desenho e Animação | Programação de Computadores | Khan" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
              provedor: "khan_academy",
            },
            {
              id: "p2-texto",
              tipo: "conteudo_misto",
              titulo: "Aprendendo programação na Khan Academy",
              blocos: [
                {
                  id: "b1-texto",
                  tipo: "texto",
                  texto:
                    'Neste curso, vamos ensinar os conceitos de JavaScript (uma linguagem de programação) e as funções que você pode usar da biblioteca ProcessingJS. Antes de você se aprofundar, aqui está uma prévia de como ensinamos programação na Khan Academy, e como achamos que você aprenderá mais.\nNormalmente, ensinamos na Khan Academy usando vídeos, mas no campo da programação, ensinamos usando algo que chamamos de "conversação". Uma conversação é como um vídeo, só que é interativo: você pode pausar a qualquer momento caso queira brincar com o código por conta própria, e pode fazer a sua própria versão do código original que nós fizemos. Aqui está um GIF animado de uma conversação (existe som nas conversações reais!):',
                },
                {
                  id: "b2-gif",
                  tipo: "imagem",
                  url: "https://cdn.kastatic.org/ka-perseus-images/cee8b2a07623d8bcf2bbe793d6b9adb34464b28a.gif",
                  descricao: "Gif da conversação",
                },
                {
                  id: "b3-texto",
                  tipo: "texto",
                  texto:
                    "Depois de uma visão geral, teremos um desafio de programação passo a passo e vamos orientar você com mensagens e dicas. Se você achar que está levando muito tempo em um desafio e estiver ficando frustrado, experimente assistir novamente à explicação ou siga em frente e volte ao desafio mais tarde. Aqui temos um GIF animado do desafio do Coelho Fanfarrão:",
                },
                {
                  id: "b4-gif",
                  tipo: "imagem",
                  url: "https://cdn.kastatic.org/ka-perseus-images/d4827f994f7cf5eda8d33b6a93fa7a592786375c.gif",
                  descricao: "Desafio: Coelho Fanfarrão",
                },
                {
                  id: "b5-texto",
                  tipo: "texto",
                  texto:
                    "Quando você está aprendendo a programar, você tem que praticar, praticar e praticar. Os desafios são uma boa maneira de testar o que você aprendeu, mas queremos que você vá mais fundo. É por isso que agora temos projetos no curso, que são oportunidades de passar muito mais tempo e ser mais criativo do que você pode ser nos desafios.",
                },
                {
                  id: "b6-imagem",
                  tipo: "imagem",
                  url: "https://cdn.kastatic.org/ka-perseus-images/96f860333e8cd4aa7633671f66c9eff9d8484903.png",
                  descricao: "Projeto: O que tem para o jantar?",
                },
                {
                  id: "b7-texto",
                  tipo: "texto",
                  texto:
                    'Além dos projetos, você também deve criar programas completamente novos, sobre o que quer que esteja em sua mente. Basta clicar em "Novo programa" na página inicial de programação e consultar a documentação para se lembrar de como fazer as coisas.\n\nAh, tudo bem se você cometer erros. Isso é algo que programadores fazem o tempo todo: quebramos coisas, cometemos erros, aprendemos com eles.',
                },
                {
                  id: "b8-imagem",
                  tipo: "imagem",
                  url: "https://cdn.kastatic.org/ka-perseus-images/dea4fe86a560463b33b6c48df2f5bfdd853ec171.png",
                  descricao: "Exemplo de erro",
                },
                {
                  id: "b9-texto",
                  tipo: "texto",
                  texto:
                    'Depois de criar um programa, você pode salvá-lo e compartilhá-lo com seus amigos e familiares. Ele também aparecerá em nossa área de programas comunitários, e outros programadores poderão comentar ou fazer perguntas sobre como você fez algo. Você também pode fazer o mesmo com qualquer programa interessante que encontrar e caso você tenha uma ideia para personalizar algum programa que você vir, basta clicar em "Salvar como uma derivação" para ter sua própria cópia dele.\nAo todo, existem 40 conversações, 35 desafios e 9 projetos neste curso, e leva mais ou menos 15 a 40 horas para concluir, dependendo da complexidade dos seu projetos. Isso pode parecer muito tempo, mas vale a pena, pois no fim, você saberá os fundamentos de programação que são comuns em todas as linguagens de programação.\n\nBem-vindo ao campo da programação: somos uma comunidade para aprender juntos e inspirarmos uns aos outros para tornar as visões de nossa cabeça em realidade. Avante!',
                },
              ],
            },
          ],
        },
        {
          id: "m2-variaveis",
          titulo: "Variaveis e valores",
          descricao:
            "Use variaveis para guardar dados e reutilizar informacoes.",
          duracaoEstimadaMin: 25,
          xpRecompensa: 120,
          partes: [
            {
              id: "p1-texto",
              tipo: "texto_imagem",
              titulo: "Variaveis no JavaScript",
              texto: textoParaPreencher,
              imagens: imagemParaPreencher,
            },
            {
              id: "p2-quiz",
              tipo: "quiz",
              titulo: "Pratica de variaveis",
              questoes: quizParaPreencher,
            },
          ],
        },
      ],
    },
    {
      id: "u2-desenho-animacao",
      titulo: "Unidade 2 - Desenho e animacao",
      descricao: "Crie desenhos, formas e animacoes usando programacao.",
      ordem: 2,
      modulos: [
        {
          id: "m3-formas-coordenadas",
          titulo: "Formas e coordenadas",
          descricao: "Aprenda a posicionar elementos na tela.",
          duracaoEstimadaMin: 30,
          xpRecompensa: 120,
          partes: [
            {
              id: "p1-video",
              tipo: "video",
              titulo: "Aula em video",
              ...videoKhanParaPreencher,
            },
            {
              id: "p2-texto",
              tipo: "texto_imagem",
              titulo: "Resumo visual",
              texto: textoParaPreencher,
              imagens: imagemParaPreencher,
            },
          ],
        },
        {
          id: "m4-animacoes",
          titulo: "Animacoes simples",
          descricao:
            "Use repeticao e atualizacao de tela para criar movimento.",
          duracaoEstimadaMin: 35,
          xpRecompensa: 140,
          partes: [
            {
              id: "p1-texto",
              tipo: "texto_imagem",
              titulo: "Como a animacao acontece",
              texto: textoParaPreencher,
            },
            {
              id: "p2-quiz",
              tipo: "quiz",
              titulo: "Quiz de animacao",
              questoes: quizParaPreencher,
            },
          ],
        },
      ],
    },
  ],
};

export const cursosCatalogo: CursoDetalhado[] = [cursoProgramacaoJavascriptWeb];

export default function ProgramacaoJavascriptWebCourseRoutePlaceholder() {
  return null;
}
