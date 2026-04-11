import { useMemo } from "react";
import { useNavigate } from "react-router";

import type { LoginRequest, RegisterRequest } from "@/features/auth/types.ts";
import { useAuthStore } from "../model/authStore";
import { authApi } from "../api/authApi";
import { useAsync } from "@/shared/hooks/useAsync";

export function useAuth() {
  const navigate = useNavigate();
  const { accessToken, user, setUser, setToken, logout } = useAuthStore();

  const { execute: signInExec, isLoading: isLoginLoading, error: loginError, reset: resetLogin } = useAsync(async (data: LoginRequest) => {
    resetRegister(); // clear login loading and error state
    const { accessToken } = await authApi.login(data);
    setToken(accessToken);
    const userData = await authApi.me();
    setUser(userData);
    navigate("/");
  });

  const { execute: signUpExec, isLoading: isRegisterLoading, error: registerError,reset: resetRegister } = useAsync(async (data: RegisterRequest) => {
    resetLogin(); // clear login loading and error state
    const { accessToken } = await authApi.register(data);
    setToken(accessToken);
    const userData = await authApi.me();
    setUser(userData);
    navigate("/");
  });

  const signIn = (data: LoginRequest) => signInExec(data);
  const signUp = (data: RegisterRequest) => signUpExec(data);

  const isAuth = useMemo(() => !!accessToken, [accessToken]);

  const loginGoogle = () => {
    authApi.loginWithGoogle();
  };

  const handleAuthSuccess = async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");

    if (token) {
      setToken(token);
      
      const userData = await authApi.me();
      setUser(userData);
      navigate('/', { replace: true });
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate("/login");
    }
  };

  return {
    isLoading: isLoginLoading || isRegisterLoading,
    error: loginError || registerError,
    isAuth,
    user,
    signIn,
    signUp,
    signOut,
    loginGoogle,
    handleAuthSuccess,
  };
}
