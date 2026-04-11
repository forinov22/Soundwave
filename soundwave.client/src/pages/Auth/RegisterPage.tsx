import React, { useCallback, useState } from "react";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";

import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
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
import {useAuth} from "@/features/auth/lib/useAuth.ts";

const RegisterPage = () => {
  const { signUp, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleFormUpdate = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value }),
      [formData]
  );
  
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    await signUp({
      email: formData.email,
      password: formData.password,
      name: `${formData.firstName} ${formData.lastName}`.trim()
    });
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
              Создать аккаунт
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Присоединяйтесь к сообществу артистов прямо сейчас
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Иван"
                    value={formData.firstName}
                    onChange={handleFormUpdate}
                    className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Иванов"
                    value={formData.lastName}
                    onChange={handleFormUpdate}
                    className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleFormUpdate}
                  className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
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
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Создать аккаунт"}
            </Button>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-zinc-400">
              Уже есть аккаунт?{" "}
              <Link
                  to="/login"
                  className="text-emerald-500 hover:underline font-medium"
              >
                Войти
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
