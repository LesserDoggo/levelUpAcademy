import conteudoStyle from "@/app/css/conteudostyle";
import { ParteConteudo, QuestaoQuiz } from "@/types/course";
import { useEffect, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";

function ConteudoImage({
  url,
  descricao,
}: {
  url: string;
  descricao: string;
}) {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  useEffect(() => {
    Image.getSize(
      url,
      (width, height) => {
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        setAspectRatio(16 / 9);
      },
    );
  }, [url]);

  return (
    <View style={conteudoStyle.lessonImageBox}>
      <Image
        source={{ uri: url }}
        style={[conteudoStyle.lessonImage, { aspectRatio }]}
      />
      <Text style={conteudoStyle.lessonImageCaption}>{descricao}</Text>
    </View>
  );
}

function TextoImagemBlock({ parte }: { parte: Extract<ParteConteudo, { tipo: "texto_imagem" }> }) {
  return (
    <View style={conteudoStyle.lessonBlock}>
      <Text style={conteudoStyle.lessonBlockTitle}>{parte.titulo}</Text>
      <Text style={conteudoStyle.lessonText}>{parte.texto}</Text>

      {parte.imagens?.map((imagem) => (
        <ConteudoImage
          key={imagem.url}
          url={imagem.url}
          descricao={imagem.descricao}
        />
      ))}
    </View>
  );
}

function ConteudoMistoBlock({
  parte,
}: {
  parte: Extract<ParteConteudo, { tipo: "conteudo_misto" }>;
}) {
  return (
    <View style={conteudoStyle.lessonBlock}>
      <Text style={conteudoStyle.lessonBlockTitle}>{parte.titulo}</Text>
      {parte.descricao ? (
        <Text style={conteudoStyle.lessonText}>{parte.descricao}</Text>
      ) : null}

      {parte.blocos.map((bloco) => {
        if (bloco.tipo === "texto") {
          return (
            <Text key={bloco.id} style={conteudoStyle.lessonText}>
              {bloco.texto}
            </Text>
          );
        }

        return (
          <ConteudoImage
            key={bloco.id}
            url={bloco.url}
            descricao={bloco.descricao}
          />
        );
      })}
    </View>
  );
}

function montarHtmlVideo(embedUrl: string) {
  const conteudoEmbed = embedUrl.trim().startsWith("<iframe")
    ? embedUrl
    : `<iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #0c101c;
          }

          iframe {
            border: 0;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>${conteudoEmbed}</body>
    </html>
  `;
}

function extrairUrlDoIframe(embedUrl: string) {
  const match = embedUrl.match(/src=["']([^"']+)["']/i);
  return match?.[1] ?? embedUrl;
}

function getVideoSource(parte: Extract<ParteConteudo, { tipo: "video" }>) {
  if (parte.embedUrl) {
    return { html: montarHtmlVideo(parte.embedUrl), baseUrl: parte.url };
  }

  return { uri: parte.url };
}

function VideoBlock({ parte }: { parte: Extract<ParteConteudo, { tipo: "video" }> }) {
  const videoUrl = extrairUrlDoIframe(parte.embedUrl ?? parte.url);

  return (
    <View style={conteudoStyle.lessonBlock}>
      <Text style={conteudoStyle.lessonBlockTitle}>{parte.titulo}</Text>
      <Text style={conteudoStyle.lessonText}>{parte.descricao}</Text>

      <View style={conteudoStyle.videoWebViewContainer}>
        {Platform.OS === "web" ? (
          <iframe
            src={videoUrl}
            title={parte.titulo}
            style={{
              border: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#0c101c",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <WebView
            source={getVideoSource(parte)}
            style={conteudoStyle.videoWebView}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState
          />
        )}
      </View>
    </View>
  );
}

function QuizQuestion({
  questao,
  onAnswered,
}: {
  questao: QuestaoQuiz;
  onAnswered?: (questaoId: string) => void;
}) {
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null);
  const respondeu = respostaSelecionada !== null;
  const acertou = respostaSelecionada === questao.respostaCorretaIndex;

  return (
    <View style={conteudoStyle.quizQuestionBox}>
      <Text style={conteudoStyle.quizQuestionText}>{questao.enunciado}</Text>

      {questao.opcoes.map((opcao, index) => {
        const selecionada = respostaSelecionada === index;

        return (
          <Pressable
            key={`${questao.id}-${opcao}`}
            style={[
              conteudoStyle.quizOption,
              selecionada && conteudoStyle.quizOptionSelected,
              respondeu &&
              index === questao.respostaCorretaIndex &&
              conteudoStyle.quizOptionCorrect,
              selecionada && !acertou && conteudoStyle.quizOptionWrong,
            ]}
            onPress={() => {
              setRespostaSelecionada(index);
              onAnswered?.(questao.id);
            }}
          >
            <Text style={conteudoStyle.quizOptionText}>{opcao}</Text>
          </Pressable>
        );
      })}

      {respondeu && (
        <Text style={conteudoStyle.quizFeedback}>
          {acertou ? "Resposta correta." : "Revise este ponto e tente novamente."}
          {questao.explicacao ? ` ${questao.explicacao}` : ""}
        </Text>
      )}
    </View>
  );
}

function QuizBlock({
  parte,
  onQuizQuestionAnswered,
}: {
  parte: Extract<ParteConteudo, { tipo: "quiz" }>;
  onQuizQuestionAnswered?: (questaoId: string) => void;
}) {
  return (
    <View style={conteudoStyle.lessonBlock}>
      <Text style={conteudoStyle.lessonBlockTitle}>{parte.titulo}</Text>
      {parte.descricao ? (
        <Text style={conteudoStyle.lessonText}>{parte.descricao}</Text>
      ) : null}

      {parte.questoes.map((questao) => (
        <QuizQuestion
          key={questao.id}
          questao={questao}
          onAnswered={(questaoId) => onQuizQuestionAnswered?.(`${parte.id}:${questaoId}`)}
        />
      ))}
    </View>
  );
}

export default function LessonContentRenderer({
  parte,
  onQuizQuestionAnswered,
}: {
  parte: ParteConteudo;
  onQuizQuestionAnswered?: (questaoId: string) => void;
}) {
  if (parte.tipo === "texto_imagem") return <TextoImagemBlock parte={parte} />;
  if (parte.tipo === "conteudo_misto") return <ConteudoMistoBlock parte={parte} />;
  if (parte.tipo === "video") return <VideoBlock parte={parte} />;
  return <QuizBlock parte={parte} onQuizQuestionAnswered={onQuizQuestionAnswered} />;
}
