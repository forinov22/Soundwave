import { apiClient } from "@/shared/api/apiClient";
import type { LoginRequest, RegisterRequest } from "@/features/auth/types.ts";

export const authApi = {
  async login(data: LoginRequest) {
    const res = await apiClient.post<{ accessToken: string }>("/auth/login", data);
    return res.data;
  },

  async register(data: RegisterRequest) {
    const res = await apiClient.post<{ accessToken: string }>("/auth/register", data);
    return res.data;
  },
  
  async me() {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  loginWithGoogle() {
    globalThis.location.href = "https://localhost:5001/auth/login/google";
  },

  async refresh() {
    const res = await apiClient.post("/auth/refresh");
    return res.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },
};
