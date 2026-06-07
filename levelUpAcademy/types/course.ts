export type ParteConteudoTipo = "texto_imagem" | "conteudo_misto" | "video" | "quiz";

export interface ImagemConteudo {
  url: string;
  descricao: string;
}

export interface ParteTextoImagem {
  id: string;
  tipo: "texto_imagem";
  titulo: string;
  texto: string;
  imagens?: ImagemConteudo[];
}

export type BlocoConteudoMisto =
  | {
      id: string;
      tipo: "texto";
      texto: string;
    }
  | {
      id: string;
      tipo: "imagem";
      url: string;
      descricao: string;
    };

export interface ParteConteudoMisto {
  id: string;
  tipo: "conteudo_misto";
  titulo: string;
  descricao?: string;
  blocos: BlocoConteudoMisto[];
}

export interface ParteVideo {
  id: string;
  tipo: "video";
  titulo: string;
  descricao: string;
  url: string;
  embedUrl?: string;
  provedor: "khan_academy" | "youtube" | "outro";
}

export interface QuestaoQuiz {
  id: string;
  enunciado: string;
  opcoes: string[];
  respostaCorretaIndex: number;
  explicacao?: string;
}

export interface ParteQuiz {
  id: string;
  tipo: "quiz";
  titulo: string;
  descricao?: string;
  questoes: QuestaoQuiz[];
}

export type ParteConteudo =
  | ParteTextoImagem
  | ParteConteudoMisto
  | ParteVideo
  | ParteQuiz;

export interface ModuloCurso {
  id: string;
  titulo: string;
  descricao: string;
  duracaoEstimadaMin: number;
  xpRecompensa: number;
  moedasRecompensa?: number;
  partes: ParteConteudo[];
}

export interface UnidadeCurso {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  modulos: ModuloCurso[];
}

export interface CursoDetalhado {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string[];
  nivel: "Iniciante" | "Intermediario" | "Avancado";
  thumbnail?: string;
  unidades: UnidadeCurso[];
}

export interface ProgressoCursoLocal {
  cursoId: string;
  modulosConcluidos: string[];
  ultimoModuloId: string | null;
  atualizadoEm: string;
}

export interface ProgressoCursoUsuario extends ProgressoCursoLocal {
  titulo: string;
  porcentagem: number;
  xpGanho: number;
  moedasGanhas: number;
  concluido: boolean;
}
