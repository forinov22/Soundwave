import React, {useCallback, useState} from "react";
import { Link } from "react-router";
import {Loader2} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logo from "@/assets/logo.svg";
import { useAuth } from "@/features/auth/lib/useAuth";

const LoginPage = () => {
  const { isLoading, error, signIn, loginGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleFormUpdate = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value }),
      [formData]
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    await signIn({ email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-zinc-900 via-zinc-900 to-black">
      <Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700/50 text-zinc-100 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-2">
          <CardHeader className="space-y-2 flex flex-col items-center">
            <Link to="/" className="mb-2">
              <img src={logo} alt="logo" className="size-12" />
            </Link>
            <CardTitle className="text-2xl font-bold tracking-tight">
              С возвращением
            </CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Введите свои данные для входа в аккаунт
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormUpdate}
                  required
                  placeholder="name@example.com"
                  className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link
                    to="/forgot-password"
                    className="text-xs text-emerald-500 hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
              <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleFormUpdate}
                  className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500"
              />
            </div>
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Войти"}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Разделитель */}
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#18181b] px-2 text-zinc-400">
                Или продолжите через
              </span>
              </div>
            </div>

            {/* Кнопка Google */}
            <Button
                variant="outline"
                className="w-full bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-100 transition-colors"
                onClick={loginGoogle}
            >
              <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
              >
                <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Google
            </Button>

            <div className="text-center text-sm text-zinc-400">
              Нет аккаунта?{" "}
              <Link
                  to="/register"
                  className="text-emerald-500 hover:underline font-medium"
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
