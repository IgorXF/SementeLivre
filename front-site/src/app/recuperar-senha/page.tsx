"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
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

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success(
      "Se este e-mail estiver cadastrado, você receberá as instruções."
    );
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-green-50 via-green-200 to-green-500">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-300/40" />
        <div className="absolute top-1/2 -right-20 w-64 h-64 rounded-full bg-green-600/30" />
        <div className="absolute -bottom-32 left-10 w-80 h-80 rounded-full bg-green-400/25" />

        <div className="relative z-10 text-center space-y-6">
          <div className="text-8xl select-none">🔑</div>
          <h1 className="text-4xl font-extrabold text-green-900 tracking-tight drop-shadow">
            Recuperar Acesso
          </h1>
          <p className="text-lg text-green-800 max-w-xs leading-relaxed mx-auto">
            Informe seu e-mail e enviaremos as instruções para redefinir sua
            senha.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex flex-col items-center gap-1 mb-2">
            <span className="text-5xl">🌱</span>
            <h1 className="text-2xl font-bold text-green-700">Semente Livre</h1>
          </div>

          <Card className="shadow-2xl border-green-100 rounded-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Recuperar senha
              </CardTitle>
              <CardDescription className="text-gray-500">
                Insira seu e-mail cadastrado para receber as instruções.
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-5 rounded-xl transition-colors"
                >
                  {loading ? "Enviando..." : "Enviar instruções"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-green-600 font-semibold hover:underline"
                >
                  ← Voltar ao login
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
