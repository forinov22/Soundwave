import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { User } from "@/shared/types/user";

type AuthState = {
  accessToken: string | null;
  user: User | null;

  setToken: (token: string | null) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        user: null,

        setToken: (token) =>
          set(
            { accessToken: token },
            false,
            "auth/setToken"
          ),

        logout: () =>
          set(
            { accessToken: null, user: null },
            false,
            "auth/logout"
          ),

        setUser: (user) =>
          set({ user }, false, "auth/setUser"),
      }),
      {
        name: "auth-storage",
      }
    )
  )
);