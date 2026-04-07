// ------------- SIMULADOR DE PROGRESSO TEMPORARIO -------------
// Interface para garantir que você não erre o nome das propriedades depois
export interface CursoProgresso {
  id: number;
  titulo: string;
  aulaAtual: string;
  porcentagem: number; // de 0 a 1
}

// Lista de cursos para o seu "Debug" usar
const cursosMock: CursoProgresso[] = [
  {
    id: 1,
    titulo: "Lógica de Programação",
    aulaAtual: "Estruturas de Repetição",
    porcentagem: 0.4,
  },
  {
    id: 2,
    titulo: "Desenvolvimento Mobile",
    aulaAtual: "Navegação com Expo Router",
    porcentagem: 0.75,
  },
  {
    id: 3,
    titulo: "Interface de Usuário (UI)",
    aulaAtual: "Teoria das Cores",
    porcentagem: 0.15,
  },
  {
    id: 4,
    titulo: "Banco de Dados",
    aulaAtual: "Comandos SELECT",
    porcentagem: 0.95,
  },
];

export const courseService = {
  // Simula buscar o curso que o usuário está fazendo no momento
  getCursoAtual: (): CursoProgresso => {
    const indiceAleatorio = Math.floor(Math.random() * cursosMock.length);
    return cursosMock[indiceAleatorio];
  },

  // Retorna uma cor baseada no progresso para a barra ficar bonita
  getCorBarra: (pct: number): string => {
    if (pct < 0.27) return "#390b3b"; // Laranja/Vermelho (Pouco progresso)
    if (pct < 0.7) return "#7c1272"; // Amarelo (Metade)
    return "#880ca7"; // Verde (Quase lá)
  },
};
