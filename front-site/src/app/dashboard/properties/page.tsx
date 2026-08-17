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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Maximize2,
  Loader2,
  Warehouse,
} from "lucide-react";
import type { Property, Plantio } from "@/lib/types";

// ── Zod schema ──────────────────────────────────────────────────────────────
const propertySchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres."),
  area_total: z
    .number({ error: "Área deve ser um número." })
    .positive("Área deve ser maior que zero."),
});

// ── Types ────────────────────────────────────────────────────────────────────
type ModalMode =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; property: Property }
  | { type: "delete"; property: Property };

const emptyForm = { nome: "", endereco: "", area_total: "" };

// ── Component ────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [plantios, setPlantios] = useState<Plantio[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalMode>({ type: "closed" });
  const [form, setForm] = useState(emptyForm);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/properties").then((r) => r.json()),
      fetch("/api/plantios").then((r) => r.json()),
    ])
      .then(([props, plants]: [Property[], Plantio[]]) => {
        setProperties(props);
        setPlantios(plants);
      })
      .catch(() => toast.error("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, []);

  // ── Pre-fill form when modal changes ──────────────────────────────────────
  useEffect(() => {
    if (modal.type === "edit") {
      setForm({
        nome: modal.property.nome,
        endereco: modal.property.endereco,
        area_total: String(modal.property.area_total),
      });
    } else if (modal.type === "add") {
      setForm(emptyForm);
    }
  }, [modal.type]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────────
  function parseAndValidate() {
    return propertySchema.safeParse({
      nome: form.nome,
      endereco: form.endereco,
      area_total: parseFloat(form.area_total),
    });
  }

  function handleDeleteClick(property: Property) {
    // Client-side dependency check before even opening the dialog
    const hasActive = plantios.some(
      (p) =>
        p.id_propriedade === property.id_propriedade && p.status === "ativo"
    );
    if (hasActive) {
      toast.error(
        "Esta propriedade possui cultivos ativos e não pode ser removida."
      );
      return;
    }
    setModal({ type: "delete", property });
  }

  // ── API handlers ──────────────────────────────────────────────────────────
  async function handleAdd() {
    const result = parseAndValidate();
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const created: Property = await res.json();
      setProperties((p) => [...p, created]);
      setModal({ type: "closed" });
      toast.success("Propriedade adicionada!");
    } catch {
      toast.error("Erro ao adicionar propriedade.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (modal.type !== "edit") return;

    const result = parseAndValidate();
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_propriedade: modal.property.id_propriedade,
          ...result.data,
        }),
      });
      const updated: Property = await res.json();
      setProperties((p) =>
        p.map((prop) =>
          prop.id_propriedade === updated.id_propriedade ? updated : prop
        )
      );
      setModal({ type: "closed" });
      toast.success("Propriedade atualizada!");
    } catch {
      toast.error("Erro ao atualizar propriedade.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (modal.type !== "delete") return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/properties?id_propriedade=${modal.property.id_propriedade}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao excluir propriedade.");
        return;
      }

      setProperties((p) =>
        p.filter(
          (prop) => prop.id_propriedade !== modal.property.id_propriedade
        )
      );
      setModal({ type: "closed" });
      toast.success("Propriedade excluída.");
    } catch {
      toast.error("Erro ao excluir propriedade.");
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
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propriedades</h1>
          <p className="text-gray-500 text-sm mt-1">
            {properties.length === 0
              ? "Nenhuma propriedade cadastrada."
              : `${properties.length} propriedade${properties.length > 1 ? "s" : ""} cadastrada${properties.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <Button
          onClick={() => setModal({ type: "add" })}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Propriedade
        </Button>
      </div>

      {/* ── Empty state ── */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-green-200 gap-3">
          <Warehouse className="w-12 h-12 text-green-200" />
          <p className="text-gray-500 text-sm">
            Nenhuma propriedade cadastrada ainda.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModal({ type: "add" })}
            className="border-green-300 text-green-700 hover:bg-green-50 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar primeira propriedade
          </Button>
        </div>
      )}

      {/* ── Property cards grid ── */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <Card
              key={prop.id_propriedade}
              className="group hover:shadow-md transition-shadow border-green-100 bg-white"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Warehouse className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-gray-400 hover:text-green-700 hover:bg-green-50"
                      onClick={() =>
                        setModal({ type: "edit", property: prop })
                      }
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteClick(prop)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base mt-2">{prop.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex items-start gap-1.5 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-400" />
                  <span className="leading-snug">{prop.endereco}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Maximize2 className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                  <span>
                    <span className="font-semibold text-gray-700">
                      {prop.area_total}
                    </span>{" "}
                    ha
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={modal.type === "add" || modal.type === "edit"}
        onOpenChange={(open) => !open && setModal({ type: "closed" })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modal.type === "add" ? "Nova Propriedade" : "Editar Propriedade"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="prop-nome">Nome da propriedade</Label>
              <Input
                id="prop-nome"
                placeholder="Ex: Sítio Boa Esperança"
                value={form.nome}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nome: e.target.value }))
                }
                className="border-green-200 focus-visible:ring-green-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prop-endereco">Endereço / Localização</Label>
              <Input
                id="prop-endereco"
                placeholder="Ex: Estrada Municipal km 5"
                value={form.endereco}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endereco: e.target.value }))
                }
                className="border-green-200 focus-visible:ring-green-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prop-area">Área total (hectares)</Label>
              <Input
                id="prop-area"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 12.5"
                value={form.area_total}
                onChange={(e) =>
                  setForm((p) => ({ ...p, area_total: e.target.value }))
                }
                className="border-green-200 focus-visible:ring-green-400"
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
            <AlertDialogTitle>Excluir propriedade?</AlertDialogTitle>
            <AlertDialogDescription>
              A propriedade{" "}
              <strong>
                {modal.type === "delete" ? modal.property.nome : ""}
              </strong>{" "}
              será removida permanentemente. Esta ação não pode ser desfeita.
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
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
