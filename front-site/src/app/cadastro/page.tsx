"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Loader2, UploadCloud, FileCheck2, ShieldCheck } from "lucide-react";

const schema = z
  .object({
    nome_responsavel: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("E-mail inválido."),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme a senha."),
    nome_comunidade: z.string().min(3, "Nome da comunidade deve ter pelo menos 3 caracteres."),
    localizacao: z.string().min(2, "Informe a localização."),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export default function CadastroPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nome_responsavel: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    nome_comunidade: "",
    localizacao: "",
  });
  const [docFile, setDocFile] = useState<{ nome: string; base64: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocFile({
        nome: file.name,
        base64: (reader.result as string).split(",")[1] ?? "",
      });
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    if (!docFile) {
      toast.error("Anexe o documento comprobatório do quilombo.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_responsavel: form.nome_responsavel,
          email: form.email,
          senha: form.senha,
          nome_comunidade: form.nome_comunidade,
          localizacao: form.localizacao,
          documento_nome: docFile.nome,
          documento_base64: docFile.base64,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao enviar solicitação.");
        return;
      }

      toast.success(
        "Solicitação enviada! Aguarde a aprovação do administrador."
      );
      router.push("/login");
    } catch {
      toast.error("Erro ao enviar solicitação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-green-600 via-green-400 to-green-200">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-green-700/25" />

        <div className="relative z-10 text-center space-y-6">
          <div className="text-7xl select-none">🌿</div>
          <h1 className="text-4xl font-extrabold text-green-900 tracking-tight">
            Registre sua comunidade
          </h1>
          <p className="text-green-800 text-base max-w-xs leading-relaxed mx-auto">
            Comunidades quilombolas reconhecidas podem cadastrar seu banco de
            sementes e conectar-se com toda a rede.
          </p>
          <div className="space-y-3 text-left max-w-xs mx-auto pt-2">
            {[
              "Envie sua solicitação com o comprovante",
              "O administrador analisa em até 48h",
              "Com aprovação, você acessa o painel completo",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-green-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 overflow-y-auto">
        <div className="w-full max-w-lg space-y-5 py-6">
          <div className="lg:hidden flex flex-col items-center gap-1 mb-2">
            <span className="text-5xl">🌿</span>
            <h1 className="text-2xl font-bold text-green-700">Semente Livre</h1>
          </div>

          <Card className="shadow-2xl border-green-100 rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <CardTitle className="text-xl font-bold text-gray-800">
                  Solicitação de cadastro
                </CardTitle>
              </div>
              <CardDescription>
                Preencha os dados da comunidade. Após análise do comprovante, o
                acesso será liberado.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Responsible person */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Responsável
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome_responsavel">
                      Nome completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nome_responsavel"
                      name="nome_responsavel"
                      placeholder="João da Silva"
                      value={form.nome_responsavel}
                      onChange={handleChange}
                      className="border-green-200 focus-visible:ring-green-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">
                      E-mail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contato@comunidade.org"
                      value={form.email}
                      onChange={handleChange}
                      className="border-green-200 focus-visible:ring-green-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="senha">
                      Senha <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      placeholder="Mín. 6 caracteres"
                      value={form.senha}
                      onChange={handleChange}
                      className="border-green-200 focus-visible:ring-green-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmarSenha">
                      Confirmar senha <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      placeholder="••••••••"
                      value={form.confirmarSenha}
                      onChange={handleChange}
                      className="border-green-200 focus-visible:ring-green-400"
                    />
                  </div>
                </div>

                {/* Community */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-2">
                  Comunidade Quilombola
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome_comunidade">
                      Nome da comunidade <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nome_comunidade"
                      name="nome_comunidade"
                      placeholder="Quilombo dos Coelhos"
                      value={form.nome_comunidade}
                      onChange={handleChange}
                      className="border-green-200 focus-visible:ring-green-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="localizacao">
                      Estado/Município <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="localizacao"
                      name="localizacao"
                      placeholder="Pernambuco - PE"
                      value={form.localizacao}
                      onChange={handleChange}
                      className="border-green-200 focus-visible:ring-green-400"
                    />
                  </div>
                </div>

                {/* Document upload */}
                <div className="space-y-1.5">
                  <Label>
                    Documento comprobatório{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      docFile
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50/40"
                    }`}
                  >
                    {docFile ? (
                      <>
                        <FileCheck2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-green-700 truncate">
                            {docFile.nome}
                          </p>
                          <p className="text-xs text-green-500">
                            Documento anexado. Clique para substituir.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Clique para anexar o comprovante
                          </p>
                          <p className="text-xs text-gray-400">
                            Certidão da SEPPIR, portaria INCRA, ou similar
                            (PDF, JPG, PNG)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5 rounded-xl gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando solicitação...
                    </>
                  ) : (
                    "Enviar solicitação"
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-gray-500">
                Já tem uma conta aprovada?{" "}
                <Link
                  href="/login"
                  className="text-green-600 font-semibold hover:underline"
                >
                  Entrar
                </Link>
              </div>
              <div className="mt-2 text-center">
                <Link
                  href="/"
                  className="text-xs text-gray-400 hover:text-green-600 transition-colors"
                >
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

