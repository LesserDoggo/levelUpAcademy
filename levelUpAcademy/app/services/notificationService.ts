import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type CanalNotificacao = "email" | "push";
export type FrequenciaNotificacao = "diaria" | "semanal" | "mensal";

export interface PreferenciasNotificacao {
  canal: CanalNotificacao;
  frequencia: FrequenciaNotificacao;
  habilitado: boolean;
}

const STUDY_REMINDER_ID = "levelup-study-reminder";
const STUDY_REMINDER_CHANNEL_ID = "study-reminders";
const STUDY_REMINDER_HOUR = 19;
const STUDY_REMINDER_MINUTE = 0;

export function configurarHandlerNotificacoes() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function cancelarNotificacoesDeEstudo() {
  if (Platform.OS === "web") return;

  const agendadas = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    agendadas
      .filter((notificacao) => notificacao.identifier.startsWith(STUDY_REMINDER_ID))
      .map((notificacao) => Notifications.cancelScheduledNotificationAsync(notificacao.identifier)),
  );
}

async function prepararCanalAndroid() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL_ID, {
    name: "Lembretes de estudo",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#a855f7",
  });
}

async function garantirPermissaoPush() {
  const permissaoAtual = await Notifications.getPermissionsAsync();
  if (permissaoAtual.granted) return true;

  const novaPermissao = await Notifications.requestPermissionsAsync();
  return novaPermissao.granted;
}

function getGatilho(frequencia: FrequenciaNotificacao): Notifications.NotificationTriggerInput {
  if (frequencia === "diaria") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: STUDY_REMINDER_CHANNEL_ID,
      hour: STUDY_REMINDER_HOUR,
      minute: STUDY_REMINDER_MINUTE,
    };
  }

  if (frequencia === "semanal") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      channelId: STUDY_REMINDER_CHANNEL_ID,
      weekday: 2,
      hour: STUDY_REMINDER_HOUR,
      minute: STUDY_REMINDER_MINUTE,
    };
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
    channelId: STUDY_REMINDER_CHANNEL_ID,
    day: 1,
    hour: STUDY_REMINDER_HOUR,
    minute: STUDY_REMINDER_MINUTE,
  };
}

export async function sincronizarNotificacoesEstudo(preferencias?: PreferenciasNotificacao | null) {
  if (Platform.OS === "web") {
    return { ativo: false, motivo: "web-nao-suportado" as const };
  }

  await cancelarNotificacoesDeEstudo();

  if (!preferencias?.habilitado) {
    return { ativo: false, motivo: "desativado" as const };
  }

  if (preferencias.canal === "email") {
    return { ativo: false, motivo: "email-pendente" as const };
  }

  await prepararCanalAndroid();

  const permitido = await garantirPermissaoPush();
  if (!permitido) {
    return { ativo: false, motivo: "permissao-negada" as const };
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: STUDY_REMINDER_ID,
    content: {
      title: "Hora de estudar",
      body: "Estude hoje e mantenha sua ofensiva.",
      sound: true,
      data: { route: "/(tabs)/cursos" },
    },
    trigger: getGatilho(preferencias.frequencia),
  });

  return { ativo: true, identifier };
}

export async function enviarNotificacaoTesteEstudo() {
  if (Platform.OS === "web") {
    return { ativo: false, motivo: "web-nao-suportado" as const };
  }

  await prepararCanalAndroid();

  const permitido = await garantirPermissaoPush();
  if (!permitido) {
    return { ativo: false, motivo: "permissao-negada" as const };
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: `${STUDY_REMINDER_ID}-test-${Date.now()}`,
    content: {
      title: "Hora de estudar",
      body: "Estude hoje e mantenha sua ofensiva.",
      sound: true,
      data: { route: "/(tabs)/cursos", teste: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: STUDY_REMINDER_CHANNEL_ID,
      seconds: 5,
    },
  });

  return { ativo: true, identifier };
}
