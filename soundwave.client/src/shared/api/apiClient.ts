import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/model/authStore";

const skipRefreshUrls = Object.freeze([
  "/auth/login",
  "/auth/register",
  "/auth/refresh"
]);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

type RefreshQueueCallback = (token: string) => void;
let isRefreshing = false;
let queue: RefreshQueueCallback[] = [];

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Нам нужен originalRequest, чтобы повторить его позже
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (!originalRequest) {
        return Promise.reject(error);
      }

      const shouldSkip = skipRefreshUrls.some(url => originalRequest.url?.includes(url));

      if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve) => {
            queue.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          const res = await axios.post(
              `${import.meta.env.VITE_API_URL}/auth/refresh`,
              {},
              { withCredentials: true }
          );

          const newToken = res.data.accessToken;
          useAuthStore.getState().setToken(newToken);

          // Рассылаем новый токен всем ожидающим запросам
          queue.forEach((cb) => cb(newToken));
          queue = [];

          return apiClient(originalRequest);
        } catch (err) {
          queue = []; // Очищаем очередь при провале рефреша
          useAuthStore.getState().logout();
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
);
