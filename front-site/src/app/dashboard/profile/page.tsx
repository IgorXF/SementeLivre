"use client";

import { useEffect, useState } from "react";
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
import { Loader2, KeyRound, ChevronDown, ChevronUp, Save } from "lucide-react";
import type { Proprietario } from "@/lib/types";

const profileSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  telefone: z.string().min(8, "Telefone inválido."),
  cpf: z.string().min(11, "CPF inválido."),
});

const passwordSchema = z
  .object({
    senhaAtual: z.string().min(1, "Senha atual é obrigatória."),
    novaSenha: z
      .string()
      .min(6, "Nova senha deve ter pelo menos 6 caracteres."),
    confirmarNovaSenha: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((d) => d.novaSenha === d.confirmarNovaSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarNovaSenha"],
  });

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", cpf: "" });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarNovaSenha: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/proprietario");
        const data: Proprietario = await res.json();
        setForm({ nome: data.nome, telefone: data.telefone, cpf: data.cpf });
      } catch {
        toast.error("Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const profileResult = profileSchema.safeParse(form);
    if (!profileResult.success) {
      toast.error(profileResult.error.issues[0].message);
      return;
    }

    let passwordPayload: Record<string, string> = {};
    if (showPasswordSection) {
      const pwResult = passwordSchema.safeParse(passwordForm);
      if (!pwResult.success) {
        toast.error(pwResult.error.issues[0].message);
        return;
      }
      passwordPayload = {
        senha_atual: passwordForm.senhaAtual,
        nova_senha: passwordForm.novaSenha,
      };
    }

    setSaving(true);
    try {
      const res = await fetch("/api/proprietario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...passwordPayload }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao salvar perfil.");
        return;
      }

      const data: Proprietario = await res.json();
      setForm({ nome: data.nome, telefone: data.telefone, cpf: data.cpf });
      setShowPasswordSection(false);
      setPasswordForm({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" });
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie suas informações pessoais e credenciais de acesso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Personal info ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Dados Pessoais</CardTitle>
            <CardDescription>
              Informações associadas à sua conta de produtor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nome: e.target.value }))
                }
                className="border-green-200 focus-visible:ring-green-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(xx) xxxxx-xxxx"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, telefone: e.target.value }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="xxx.xxx.xxx-xx"
                  value={form.cpf}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cpf: e.target.value }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Password section ── */}
        <Card>
          <CardHeader className="pb-3">
            <button
              type="button"
              onClick={() => setShowPasswordSection((p) => !p)}
              className="flex items-center justify-between w-full text-left group"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-green-600" />
                <CardTitle className="text-base">Alterar Senha</CardTitle>
              </div>
              {showPasswordSection ? (
                <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              )}
            </button>
            {!showPasswordSection && (
              <CardDescription>
                Clique para expandir e definir uma nova senha.
              </CardDescription>
            )}
          </CardHeader>

          {showPasswordSection && (
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-1.5">
                <Label htmlFor="senhaAtual">Senha atual</Label>
                <Input
                  id="senhaAtual"
                  type="password"
                  placeholder="Digite sua senha atual para confirmar"
                  value={passwordForm.senhaAtual}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      senhaAtual: e.target.value,
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={passwordForm.novaSenha}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        novaSenha: e.target.value,
                      }))
                    }
                    className="border-green-200 focus-visible:ring-green-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmarNovaSenha">Confirmar</Label>
                  <Input
                    id="confirmarNovaSenha"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={passwordForm.confirmarNovaSenha}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        confirmarNovaSenha: e.target.value,
                      }))
                    }
                    className="border-green-200 focus-visible:ring-green-400"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
