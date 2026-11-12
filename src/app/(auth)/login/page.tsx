"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PawPrint, Mail, Lock, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setSuccessMessage(
            "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro antes de entrar."
          );
        } else {
          setSuccessMessage("Conta criada com sucesso!");
          router.replace("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message || "Ocorreu um erro ao processar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Permite explorar o app com armazenamento local caso o Supabase ainda não esteja conectado
    if (typeof window !== "undefined") {
      localStorage.setItem("cuidapet_demo_user", JSON.stringify({ email: "tutor@cuidapet.app" }));
    }
    router.replace("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 py-8">
      {/* Top Brand */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="w-18 h-18 p-4 rounded-3xl bg-emerald-50 text-primary flex items-center justify-center shadow-soft mb-3 border border-emerald-100">
          <PawPrint className="w-10 h-10 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950">
          Cuida<span className="text-primary">Pet</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
          Saúde, vacinas e nutrição do seu melhor amigo em um só lugar.
        </p>
      </div>

      {/* Auth Card */}
      <Card className="my-6 border-emerald-100 shadow-card">
        <CardContent className="pt-6">
          <div className="flex border-b border-gray-100 pb-3 mb-5 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-all ${
                !isSignUp
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-all ${
                isSignUp
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Cadastrar
            </button>
          </div>

          {!configured && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Supabase não configurado</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Adicione suas chaves no arquivo <code className="bg-amber-100 px-1 rounded">.env.local</code>. Você também pode clicar abaixo para navegar no modo demonstração.
              </p>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="mt-2 text-xs font-bold text-emerald-800 underline flex items-center gap-1"
              >
                Entrar em modo demonstração <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-12 text-sm font-bold shadow-md"
            >
              {loading ? (
                "Carregando..."
              ) : isSignUp ? (
                "Criar Minha Conta"
              ) : (
                "Entrar no CuidaPet"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span>CuidaPet PWA • Cuidado veterinário inteligente</span>
      </div>
    </div>
  );
}

