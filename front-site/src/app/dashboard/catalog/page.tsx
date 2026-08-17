"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
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
  Loader2,
  Plus,
  Search,
  Leaf,
  Pencil,
  Trash2,
  FlaskConical,
  BookOpen,
} from "lucide-react";
import type { Species, SpeciesStatus, TipoSemente, UnidadePesagem } from "@/lib/types";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  SpeciesStatus,
  { label: string; className: string }
> = {
  exchange: {
    label: "Para Troca",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  sale: {
    label: "Para Venda",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  donation: {
    label: "Para Doação",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  unavailable: {
    label: "Indisponível",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const TIPO_OPTIONS: { value: TipoSemente; label: string }[] = [
  { value: "HORTALICA", label: "Hortaliça" },
  { value: "FRUTIFERA", label: "Frutífera" },
  { value: "FORRAGEIRA", label: "Forrageira" },
  { value: "CEREAL", label: "Cereal" },
  { value: "LEGUMINOSA", label: "Leguminosa" },
  { value: "OUTRAS", label: "Outras" },
];

const UNIDADE_OPTIONS: { value: UnidadePesagem; label: string }[] = [
  { value: "SACA", label: "Saca" },
  { value: "KG", label: "KG" },
  { value: "GRAMA", label: "Grama" },
  { value: "MG", label: "MG" },
  { value: "UNIDADE", label: "Unidade" },
];

// ── Form type ─────────────────────────────────────────────────────────────────
const emptyForm = {
  nome_popular: "",
  nome_cientifico: "",
  familia_botanica: "",
  descricao: "",
  foto: "",
  status: "" as SpeciesStatus | "",
  tipoSemente: "" as TipoSemente | "",
  quantidadeEstoque: "" as number | "",
  preco: "" as number | "",
  unidadePesagem: "" as UnidadePesagem | "",
};

type FormState = typeof emptyForm;
type ModalMode =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; species: Species }
  | { type: "delete"; species: Species };

// ── Component ─────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>({ type: "closed" });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then(setSpecies)
      .catch(() => toast.error("Erro ao carregar catálogo."))
      .finally(() => setLoading(false));
  }, []);

  // ── Pre-fill on modal open ─────────────────────────────────────────────────
  useEffect(() => {
    if (modal.type === "edit") {
      const { id_especie: _omit, ...rest } = modal.species;
      setForm({
        nome_popular: rest.nome_popular ?? "",
        nome_cientifico: rest.nome_cientifico ?? "",
        familia_botanica: rest.familia_botanica ?? "",
        descricao: rest.descricao ?? "",
        foto: rest.foto ?? "",
        status: rest.status ?? "",
        tipoSemente: rest.tipoSemente ?? "",
        quantidadeEstoque: rest.quantidadeEstoque ?? "",
        preco: rest.preco ?? "",
        unidadePesagem: rest.unidadePesagem ?? "",
      });
    } else if (modal.type === "add") {
      setForm(emptyForm);
    }
    setTouched({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.type]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = species.filter((s) =>
    s.nome_popular.toLowerCase().includes(search.toLowerCase())
  );

  // ── Validation helpers ─────────────────────────────────────────────────────
  function isInvalid(field: "nome_popular" | "status") {
    if (!touched[field]) return false;
    return !form[field];
  }

  function markTouched(field: keyof FormState) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function validateForm(): boolean {
    setTouched({ nome_popular: true, status: true });
    if (!form.nome_popular || !form.status) {
      toast.error("Preencha os campos obrigatórios: nome popular e status.");
      return false;
    }
    return true;
  }

  // ── API handlers ───────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created: Species = await res.json();
      setSpecies((p) => [...p, created]);
      setModal({ type: "closed" });
      toast.success("Espécie cadastrada no catálogo!");
    } catch {
      toast.error("Erro ao cadastrar espécie.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (modal.type !== "edit") return;
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_especie: modal.species.id_especie,
          ...form,
        }),
      });
      const updated: Species = await res.json();
      setSpecies((p) =>
        p.map((s) => (s.id_especie === updated.id_especie ? updated : s))
      );
      setModal({ type: "closed" });
      toast.success("Espécie atualizada!");
    } catch {
      toast.error("Erro ao atualizar espécie.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (modal.type !== "delete") return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/catalog?id_especie=${modal.species.id_especie}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        if (err.dependencies?.length) {
          toast.error(
            `Não é possível remover: ${err.dependencies.join(" | ")}`
          );
        } else {
          toast.error(err.error ?? "Erro ao remover espécie.");
        }
        setModal({ type: "closed" });
        return;
      }
      setSpecies((p) =>
        p.filter((s) => s.id_especie !== modal.species.id_especie)
      );
      setModal({ type: "closed" });
      toast.success("Espécie removida do catálogo.");
    } catch {
      toast.error("Erro ao remover espécie.");
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catálogo de Sementes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {species.length} espécie{species.length !== 1 ? "s" : ""}{" "}
            registrada{species.length !== 1 ? "s" : ""} no banco comunitário.
          </p>
        </div>
        <Button
          onClick={() => setModal({ type: "add" })}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Espécie
        </Button>
      </div>

      {/* ── Search bar ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome popular..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-green-200 focus-visible:ring-green-400"
        />
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-56 bg-white rounded-2xl border border-dashed border-green-200 gap-3">
          <Leaf className="w-10 h-10 text-green-200" />
          <p className="text-gray-500 text-sm">
            {search
              ? `Nenhuma espécie encontrada para "${search}".`
              : "Nenhuma espécie cadastrada."}
          </p>
        </div>
      )}

      {/* ── Cards grid ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((sp) => {
            const statusCfg = STATUS_CONFIG[sp.status];
            return (
              <Card
                key={sp.id_especie}
                className="group flex flex-col border-green-100 bg-white hover:shadow-md transition-shadow"
              >
                {/* Photo area */}
                <div className="h-36 rounded-t-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
                  {sp.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sp.foto}
                      alt={sp.nome_popular}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Leaf className="w-14 h-14 text-green-300" />
                  )}
                </div>

                <CardHeader className="pb-1 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {sp.nome_popular}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium flex-shrink-0 ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3 space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FlaskConical className="w-3 h-3" />
                    <span className="italic">{sp.nome_cientifico || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <BookOpen className="w-3 h-3" />
                    <span>{sp.familia_botanica || "—"}</span>
                  </div>
                  {sp.tipoSemente && (
                    <span className="inline-block bg-green-100 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-green-200">
                      {TIPO_OPTIONS.find((t) => t.value === sp.tipoSemente)?.label ?? sp.tipoSemente}
                    </span>
                  )}
                  {sp.quantidadeEstoque != null && (
                    <p className="text-xs text-gray-600">
                      📦 {sp.quantidadeEstoque} {sp.unidadePesagem ?? "unid."}
                    </p>
                  )}
                  {sp.descricao && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 pt-1">
                      {sp.descricao}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="pt-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 border-green-200 text-green-700 hover:bg-green-50 text-xs h-8"
                    onClick={() => setModal({ type: "edit", species: sp })}
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                    onClick={() => setModal({ type: "delete", species: sp })}
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={modal.type === "add" || modal.type === "edit"}
        onOpenChange={(open) => !open && setModal({ type: "closed" })}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal.type === "add" ? "Cadastrar Nova Espécie" : "Editar Espécie"}
            </DialogTitle>
          </DialogHeader>

          <form ref={formRef} className="space-y-4 py-2" noValidate>
            {/* nome_popular — required */}
            <div className="space-y-1.5">
              <Label htmlFor="nome_popular">
                Nome popular{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome_popular"
                required
                placeholder="Ex: Feijão Crioulo"
                value={form.nome_popular}
                aria-invalid={isInvalid("nome_popular") ? "true" : undefined}
                onBlur={() => markTouched("nome_popular")}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nome_popular: e.target.value }))
                }
                className={`border-green-200 focus-visible:ring-green-400 ${
                  isInvalid("nome_popular")
                    ? "border-red-400 focus-visible:ring-red-300"
                    : ""
                }`}
              />
              {isInvalid("nome_popular") && (
                <p className="text-xs text-red-500">Campo obrigatório.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome_cientifico">Nome científico</Label>
                <Input
                  id="nome_cientifico"
                  placeholder="Ex: Phaseolus vulgaris"
                  value={form.nome_cientifico}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      nome_cientifico: e.target.value,
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="familia_botanica">Família botânica</Label>
                <Input
                  id="familia_botanica"
                  placeholder="Ex: Fabaceae"
                  value={form.familia_botanica}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      familia_botanica: e.target.value,
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                rows={3}
                placeholder="Descreva as características, usos e propriedades desta espécie..."
                value={form.descricao}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descricao: e.target.value }))
                }
                className="w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>

            {/* status — required */}
            <div className="space-y-1.5">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                required
                aria-invalid={isInvalid("status") ? "true" : undefined}
                value={form.status}
                onBlur={() => markTouched("status")}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value as SpeciesStatus,
                  }))
                }
                className={`w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  isInvalid("status")
                    ? "border-red-400 focus:ring-red-300"
                    : "border-green-200"
                }`}
              >
                <option value="">Selecione um status...</option>
                <option value="exchange">Para Troca</option>
                <option value="sale">Para Venda</option>
                <option value="donation">Para Doação</option>
                <option value="unavailable">Indisponível</option>
              </select>
              {isInvalid("status") && (
                <p className="text-xs text-red-500">Campo obrigatório.</p>
              )}
            </div>

            {/* tipoSemente */}
            <div className="space-y-1.5">
              <Label htmlFor="tipoSemente">Tipo de semente</Label>
              <select
                id="tipoSemente"
                value={form.tipoSemente}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tipoSemente: e.target.value as TipoSemente | "" }))
                }
                className="w-full rounded-md border border-green-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Selecione o tipo...</option>
                {TIPO_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="quantidadeEstoque">Quantidade em estoque</Label>
                <Input
                  id="quantidadeEstoque"
                  type="number"
                  min={0}
                  placeholder="Ex: 50"
                  value={form.quantidadeEstoque}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      quantidadeEstoque: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unidadePesagem">Unidade</Label>
                <select
                  id="unidadePesagem"
                  value={form.unidadePesagem}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unidadePesagem: e.target.value as UnidadePesagem | "" }))
                  }
                  className="w-full rounded-md border border-green-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Selecione...</option>
                  {UNIDADE_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.status === "sale" && (
              <div className="space-y-1.5">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Ex: 15.00"
                  value={form.preco}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      preco: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
            )}

            {/* Imagem */}
            <div className="space-y-1.5">
              <Label htmlFor="foto">Imagem da semente</Label>
              {form.foto && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-green-100 bg-green-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.foto}
                    alt="Pré-visualização"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, foto: "" }))}
                    className="absolute top-1.5 right-1.5 bg-white/80 hover:bg-white rounded-full p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Remover imagem"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                id="foto"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-green-200 file:text-xs file:font-medium file:text-green-700 file:bg-white hover:file:bg-green-50 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setForm((p) => ({ ...p, foto: reader.result as string }));
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
            </div>
          </form>

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
              {modal.type === "add" ? "Cadastrar" : "Salvar alterações"}
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
            <AlertDialogTitle>Remover espécie?</AlertDialogTitle>
            <AlertDialogDescription>
              A espécie{" "}
              <strong>
                {modal.type === "delete" ? modal.species.nome_popular : ""}
              </strong>{" "}
              será removida permanentemente do catálogo. Se houver plantios,
              estoques ou colheitas vinculadas, a remoção será bloqueada.
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
              Confirmar remoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
