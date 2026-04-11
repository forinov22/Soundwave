import { useEffect } from "react";

import { useAuthStore } from "../model/authStore";
import { authApi } from "../api/authApi";

export function useAuthBootstrap() {
  const { accessToken, setUser, logout } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await authApi.me();
        setUser(user);
      } catch {
        logout();
      }
    }

    if (accessToken) {
      loadUser();
    }
  }, [accessToken, setUser, logout]);
}
