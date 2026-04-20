export type ContentType = "text" | "video" | "quiz";

export interface LessonContent {
  type: ContentType;
  title: string;
  data: string; // Pode ser texto Markdown, URL do vídeo, ou JSON do quiz
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: LessonContent[]; // Array para múltiplos blocos de conteúdo
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  modules: Module[];
  progress?: number;
  isCompleted?: boolean;
}

export default function TypeRoutePlaceholder() {
  return null;
}
