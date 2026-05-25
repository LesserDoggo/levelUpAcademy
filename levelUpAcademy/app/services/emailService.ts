import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

const SUPORTE_EMAIL = "lucasbento358@gmail.com";

interface EmailPayload {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  text: string;
  html: string;
  tags?: string[];
}

async function enfileirarEmail({ to, cc, subject, text, html, tags = [] }: EmailPayload) {
  await addDoc(collection(db, "mail"), {
    to,
    ...(cc ? { cc } : {}),
    message: {
      subject,
      text,
      html,
    },
    tags,
    criadoEm: serverTimestamp(),
  });
}

function escaparHtml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function enviarCopiaAvaliacao(params: {
  email: string;
  nome?: string | null;
  nota: number;
  comentario: string;
}) {
  const comentario = params.comentario || "Sem comentario.";
  await enfileirarEmail({
    to: params.email,
    subject: "Recebemos sua avaliacao - LevelUp Academy",
    text: `Obrigado pela sua avaliacao, ${params.nome ?? "aluno"}!\n\nNota: ${params.nota}/5\nComentario: ${comentario}`,
    html: `
      <h2>Obrigado pela sua avaliacao!</h2>
      <p>Recebemos sua opiniao sobre o LevelUp Academy.</p>
      <p><strong>Nota:</strong> ${params.nota}/5</p>
      <p><strong>Comentario:</strong> ${escaparHtml(comentario)}</p>
    `,
    tags: ["avaliacao"],
  });
}

export async function enviarCopiaChamadoSuporte(params: {
  email: string;
  nome?: string | null;
  mensagem: string;
  chamadoId: string;
}) {
  await enfileirarEmail({
    to: params.email,
    cc: SUPORTE_EMAIL,
    subject: `Chamado de suporte recebido - ${params.chamadoId}`,
    text:
      `Recebemos seu chamado e entraremos em contato para solucionar o problema.\n\n` +
      `Usuario: ${params.nome ?? "Nao informado"}\n` +
      `E-mail: ${params.email}\n` +
      `Chamado: ${params.chamadoId}\n\n` +
      `Mensagem:\n${params.mensagem}`,
    html: `
      <h2>Chamado de suporte recebido</h2>
      <p>Recebemos seu chamado e entraremos em contato para solucionar o problema.</p>
      <p><strong>Usuario:</strong> ${escaparHtml(params.nome ?? "Nao informado")}</p>
      <p><strong>E-mail:</strong> ${escaparHtml(params.email)}</p>
      <p><strong>Chamado:</strong> ${escaparHtml(params.chamadoId)}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${escaparHtml(params.mensagem).replace(/\n/g, "<br />")}</p>
    `,
    tags: ["suporte"],
  });
}

export default function EmailServiceRoutePlaceholder() {
  return null;
}
