import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("driveflow-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      sessionStorage.removeItem("driveflow-token");
      window.dispatchEvent(new Event("driveflow-session-expired"));
    }
    return Promise.reject(error);
  },
);
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error))
    return (
      error.response?.data?.error?.message ||
      "Não foi possível conectar à API. Verifique se o servidor está disponível."
    );
  return "Ocorreu um erro inesperado. Tente novamente.";
}
