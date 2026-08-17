"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setAuthUser, type AuthUser } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Insira um e-mail válido."),
  senha: z.string().min(1, "A senha é obrigatória."),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, senha });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao realizar login.");
        return;
      }

      const user: AuthUser = await res.json();
      setAuthUser(user);
      toast.success("Login realizado com sucesso!");

      if (user.role === "admin") {
        router.push("/admin/registrations");
      } else {
        router.push("/dashboard/properties");
      }
    } catch {
      toast.error("Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-green-50 via-green-200 to-green-500">
        {/* Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-300/40" />
        <div className="absolute top-1/2 -right-20 w-64 h-64 rounded-full bg-green-600/30" />
        <div className="absolute -bottom-32 left-10 w-80 h-80 rounded-full bg-green-400/25" />

        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          <div className="text-8xl select-none">🌱</div>
          <h1 className="text-5xl font-extrabold text-green-900 tracking-tight drop-shadow">
            Semente Livre
          </h1>
          <p className="text-lg text-green-800 max-w-xs leading-relaxed mx-auto">
            Cultivando o futuro com tecnologia e sustentabilidade.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Pill label="🌿 Orgânico" />
            <Pill label="♻️ Sustentável" />
            <Pill label="🇧🇷 Nacional" />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-1 mb-2">
            <span className="text-5xl">🌱</span>
            <h1 className="text-2xl font-bold text-green-700">Semente Livre</h1>
          </div>

          <Card className="shadow-2xl border-green-100 rounded-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-gray-500">
                Entre com suas credenciais para acessar a plataforma.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-green-200 focus-visible:ring-green-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="senha"
                      className="text-gray-700 font-medium"
                    >
                      Senha
                    </Label>
                    <span className="text-sm text-green-600 hover:underline cursor-pointer">
                      <Link href="/recuperar-senha" className="text-sm text-green-600 hover:underline">
                        Esqueceu a senha?
                      </Link>
                    </span>
                  </div>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="border-green-200 focus-visible:ring-green-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-5 rounded-xl transition-colors"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Não tem uma conta?{" "}
                <Link
                  href="/cadastro"
                  className="text-green-600 font-semibold hover:underline"
                >
                  Cadastre-se gratuitamente
                </Link>
              </div>

              <div className="mt-3 text-center">
                <Link href="/" className="text-xs text-gray-400 hover:text-green-600 transition-colors">
                  ← Voltar à loja
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Semente Livre. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full bg-white/60 text-green-800 text-sm font-medium backdrop-blur-sm border border-green-200">
      {label}
    </span>
  );
}
