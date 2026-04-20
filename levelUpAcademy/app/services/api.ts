import axios from "axios";
import { auth } from "../config/firebaseConfig";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const usuario = auth.currentUser;
  if (usuario) {
    const token = await usuario.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await auth.signOut();
    }

    const mensagem =
      error.response?.data?.message ??
      (error.response?.status >= 500
        ? "Erro interno no servidor. Tente novamente."
        : "Não foi possível concluir a solicitação.");

    return Promise.reject(new Error(mensagem));
  },
);

export default api;
