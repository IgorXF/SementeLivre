"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import type { Tecnica } from "@/lib/types";

type ModalMode =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; tecnica: Tecnica }
  | { type: "delete"; tecnica: Tecnica };

const emptyForm = { nome_tecnica: "", descricao: "" };

export default function TechniquesPage() {
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalMode>({ type: "closed" });
  const [form, setForm] = useState(emptyForm);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/techniques")
      .then((r) => r.json())
      .then(setTecnicas)
      .catch(() => toast.error("Erro ao carregar técnicas."))
      .finally(() => setLoading(false));
  }, []);

  // ── Pre-fill on modal open ─────────────────────────────────────────────────
  useEffect(() => {
    if (modal.type === "edit") {
      setForm({
        nome_tecnica: modal.tecnica.nome_tecnica,
        descricao: modal.tecnica.descricao,
      });
    } else if (modal.type === "add") {
      setForm(emptyForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.type]);

  // ── Add ───────────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!form.nome_tecnica || !form.descricao) {
      toast.error("Nome e descrição são obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/techniques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created: Tecnica = await res.json();
      setTecnicas((p) => [...p, created]);
      setModal({ type: "closed" });
      toast.success("Técnica adicionada à biblioteca!");
    } catch {
      toast.error("Erro ao adicionar técnica.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  async function handleEdit() {
    if (modal.type !== "edit") return;
    if (!form.nome_tecnica || !form.descricao) {
      toast.error("Nome e descrição são obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/techniques", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tecnica: modal.tecnica.id_tecnica,
          ...form,
        }),
      });
      const updated: Tecnica = await res.json();
      setTecnicas((p) =>
        p.map((t) => (t.id_tecnica === updated.id_tecnica ? updated : t))
      );
      setModal({ type: "closed" });
      toast.success("Técnica atualizada!");
    } catch {
      toast.error("Erro ao atualizar técnica.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (modal.type !== "delete") return;
    setSubmitting(true);
    try {
      await fetch(
        `/api/techniques?id_tecnica=${modal.tecnica.id_tecnica}`,
        { method: "DELETE" }
      );
      setTecnicas((p) =>
        p.filter((t) => t.id_tecnica !== modal.tecnica.id_tecnica)
      );
      setModal({ type: "closed" });
      toast.success("Técnica removida.");
    } catch {
      toast.error("Erro ao remover técnica.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Técnicas de Cultivo
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Biblioteca de práticas agroecológicas do quilombo.
          </p>
        </div>
        <Button
          onClick={() => setModal({ type: "add" })}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Técnica
        </Button>
      </div>

      {/* ── Empty state ── */}
      {tecnicas.length === 0 && (
        <div className="flex flex-col items-center justify-center h-52 bg-white rounded-2xl border border-dashed border-green-200 gap-3">
          <BookOpen className="w-10 h-10 text-green-200" />
          <p className="text-gray-500 text-sm">
            Nenhuma técnica cadastrada ainda.
          </p>
        </div>
      )}

      {/* ── Wiki-style list ── */}
      <div className="space-y-0 divide-y divide-gray-100 bg-white rounded-2xl border border-green-100 overflow-hidden">
        {tecnicas.map((t, i) => (
          <div
            key={t.id_tecnica}
            className="group p-5 hover:bg-green-50/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 items-start flex-1 min-w-0">
                {/* Index number */}
                <span className="mt-0.5 w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                    {t.nome_tecnica}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mt-1.5 whitespace-pre-line">
                    {t.descricao}
                  </p>
                </div>
              </div>

              {/* Actions — visible on hover */}
              <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-gray-400 hover:text-green-700 hover:bg-green-100"
                  onClick={() => setModal({ type: "edit", tecnica: t })}
                  title="Alterar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setModal({ type: "delete", tecnica: t })}
                  title="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={modal.type === "add" || modal.type === "edit"}
        onOpenChange={(open) => !open && setModal({ type: "closed" })}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modal.type === "add" ? "Nova Técnica" : "Alterar Técnica"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome_tecnica">
                Nome da técnica <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome_tecnica"
                placeholder="Ex: Secagem Natural de Sementes"
                value={form.nome_tecnica}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nome_tecnica: e.target.value }))
                }
                className="border-green-200 focus-visible:ring-green-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">
                Descrição / Procedimento <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="descricao"
                rows={6}
                placeholder="Descreva detalhadamente o procedimento e as boas práticas..."
                value={form.descricao}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descricao: e.target.value }))
                }
                className="w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModal({ type: "closed" })}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={modal.type === "add" ? handleAdd : handleEdit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {modal.type === "add" ? "Adicionar" : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={modal.type === "delete"}
        onOpenChange={(open) => !open && setModal({ type: "closed" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover técnica?</AlertDialogTitle>
            <AlertDialogDescription>
              A técnica{" "}
              <strong>
                {modal.type === "delete" ? modal.tecnica.nome_tecnica : ""}
              </strong>{" "}
              será removida permanentemente da biblioteca.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
