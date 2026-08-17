"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  MapPin,
  Sprout,
  Maximize2,
  FlaskConical,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { Plantio, Adubacao, Property, Species } from "@/lib/types";

// ── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = "ativo" | "concluido";

// ── Empty forms ───────────────────────────────────────────────────────────────
const emptyPlantioForm = {
  id_propriedade: "",
  id_especie: "",
  data_inicio: "",
  previsao_colheita: "",
  area_plantada: "",
  talhao: "",
};

const emptyAdubForm = {
  data_adubacao: "",
  tipo_adubo: "",
  quantidade: "",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function PlantingsPage() {
  const [plantios, setPlantios] = useState<Plantio[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [adubacoes, setAdubacoes] = useState<Adubacao[]>([]);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ativo");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submittingAdub, setSubmittingAdub] = useState<string | null>(null);
  const [adubForms, setAdubForms] = useState<Record<string, typeof emptyAdubForm>>({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [plantioForm, setPlantioForm] = useState(emptyPlantioForm);
  const [submittingPlantio, setSubmittingPlantio] = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/plantings").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
      fetch("/api/catalog").then((r) => r.json()),
      fetch("/api/fertilization").then((r) => r.json()),
    ])
      .then(([pl, pr, sp, ad]: [Plantio[], Property[], Species[], Adubacao[]]) => {
        setPlantios(pl);
        setProperties(pr);
        setSpecies(sp);
        setAdubacoes(ad);
      })
      .catch(() => toast.error("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getProperty(id: string) {
    return properties.find((p) => p.id_propriedade === id);
  }
  function getSpecies(id: string) {
    return species.find((s) => s.id_especie === id);
  }
  function getAdubacoes(id_plantio: string) {
    return [...adubacoes.filter((a) => a.id_plantio === id_plantio)].sort(
      (a, b) => a.data_adubacao.localeCompare(b.data_adubacao)
    );
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    if (!adubForms[id]) {
      setAdubForms((prev) => ({ ...prev, [id]: { ...emptyAdubForm } }));
    }
  }

  function updateAdubForm(
    id_plantio: string,
    field: string,
    value: string
  ) {
    setAdubForms((prev) => ({
      ...prev,
      [id_plantio]: { ...prev[id_plantio], [field]: value },
    }));
  }

  // ── Mark as concluded ─────────────────────────────────────────────────────
  async function handleMarkConcluido(plantio: Plantio) {
    try {
      const res = await fetch("/api/plantings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_plantio: plantio.id_plantio, status: "concluido" }),
      });
      const updated: Plantio = await res.json();
      setPlantios((p) =>
        p.map((pl) => (pl.id_plantio === updated.id_plantio ? updated : pl))
      );
      toast.success("Ciclo marcado como concluído!");
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  }

  // ── Add fertilization ─────────────────────────────────────────────────────
  async function handleAddAdubacao(id_plantio: string) {
    const form = adubForms[id_plantio];
    if (!form?.data_adubacao || !form?.tipo_adubo || !form?.quantidade) {
      toast.error("Preencha todos os campos de adubação.");
      return;
    }

    setSubmittingAdub(id_plantio);
    try {
      const res = await fetch("/api/fertilization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_plantio,
          data_adubacao: form.data_adubacao,
          tipo_adubo: form.tipo_adubo,
          quantidade: Number(form.quantidade),
        }),
      });
      const created: Adubacao = await res.json();
      setAdubacoes((prev) => [...prev, created]);
      setAdubForms((prev) => ({ ...prev, [id_plantio]: { ...emptyAdubForm } }));
      toast.success("Adubação registrada!");
    } catch {
      toast.error("Erro ao registrar adubação.");
    } finally {
      setSubmittingAdub(null);
    }
  }

  // ── Remove fertilization ──────────────────────────────────────────────────
  async function handleDeleteAdubacao(id_adubacao: string) {
    try {
      await fetch(`/api/fertilization?id_adubacao=${id_adubacao}`, {
        method: "DELETE",
      });
      setAdubacoes((prev) => prev.filter((a) => a.id_adubacao !== id_adubacao));
      toast.success("Registro removido.");
    } catch {
      toast.error("Erro ao remover registro.");
    }
  }

  // ── Add planting ──────────────────────────────────────────────────────────
  async function handleAddPlantio() {
    const { id_propriedade, id_especie, data_inicio, previsao_colheita, area_plantada, talhao } =
      plantioForm;
    if (!id_propriedade || !id_especie || !data_inicio || !previsao_colheita || !area_plantada) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmittingPlantio(true);
    try {
      const res = await fetch("/api/plantings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_propriedade,
          id_especie,
          data_inicio,
          previsao_colheita,
          area_plantada: Number(area_plantada),
          talhao,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao criar plantio.");
        return;
      }

      const created: Plantio = await res.json();
      setPlantios((p) => [...p, created]);
      setShowAddModal(false);
      setPlantioForm(emptyPlantioForm);
      setTab("ativo");
      toast.success("Ciclo de plantio iniciado!");
    } catch {
      toast.error("Erro ao criar plantio.");
    } finally {
      setSubmittingPlantio(false);
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

  const filtered = plantios.filter((p) => p.status === tab);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ciclos de Plantio
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie e acompanhe todos os ciclos produtivos.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Ciclo
        </Button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["ativo", "concluido"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-white shadow text-green-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "ativo" ? (
              <span className="flex items-center gap-1.5">
                <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                Ativos
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-gray-400" />
                Concluídos
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-52 bg-white rounded-2xl border border-dashed border-green-200 gap-3">
          <Sprout className="w-10 h-10 text-green-200" />
          <p className="text-gray-500 text-sm">
            {tab === "ativo"
              ? "Nenhum ciclo ativo no momento."
              : "Nenhum ciclo concluído."}
          </p>
        </div>
      )}

      {/* ── Plantio cards ── */}
      <div className="space-y-3">
        {filtered.map((plantio) => {
          const prop = getProperty(plantio.id_propriedade);
          const sp = getSpecies(plantio.id_especie);
          const expanded = expandedId === plantio.id_plantio;
          const adubs = getAdubacoes(plantio.id_plantio);
          const adubForm = adubForms[plantio.id_plantio] ?? emptyAdubForm;

          return (
            <Card
              key={plantio.id_plantio}
              className="border-green-100 bg-white overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">
                        {sp?.nome_popular ?? plantio.id_especie}
                      </CardTitle>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                          plantio.status === "ativo"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {plantio.status === "ativo" ? "Ativo" : "Concluído"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-green-400" />
                        {prop?.nome ?? "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sprout className="w-3 h-3 text-green-400" />
                        {plantio.talhao || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-green-400" />
                        Início: {plantio.data_inicio}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-amber-400" />
                        Prev.: {plantio.previsao_colheita}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-green-400" />
                        {plantio.area_plantada} ha
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {plantio.status === "ativo" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-green-700 hover:bg-green-50 h-7 px-2"
                        onClick={() => handleMarkConcluido(plantio)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Concluir
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-green-700 hover:bg-green-50"
                      onClick={() => toggleExpand(plantio.id_plantio)}
                    >
                      {expanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* ── Fertilization panel ── */}
              {expanded && (
                <CardContent className="pt-0 border-t border-green-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-3 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    Histórico de Adubações
                  </p>

                  {adubs.length === 0 ? (
                    <p className="text-xs text-gray-400 mb-4">
                      Nenhuma adubação registrada.
                    </p>
                  ) : (
                    <ol className="relative border-l border-green-200 mb-5 ml-2 space-y-3">
                      {adubs.map((a) => (
                        <li
                          key={a.id_adubacao}
                          className="ml-4 group"
                        >
                          <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-700">
                                {a.tipo_adubo}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {a.data_adubacao} · {a.quantidade} kg
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteAdubacao(a.id_adubacao)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Fast-submit adubação form */}
                  <div className="bg-green-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-green-800">
                      Registrar nova adubação
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-600">Data</Label>
                        <Input
                          type="date"
                          value={adubForm.data_adubacao}
                          onChange={(e) =>
                            updateAdubForm(
                              plantio.id_plantio,
                              "data_adubacao",
                              e.target.value
                            )
                          }
                          className="h-8 text-xs border-green-200 focus-visible:ring-green-400 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-600">
                          Tipo de adubo
                        </Label>
                        <Input
                          placeholder="Ex: Composto orgânico"
                          value={adubForm.tipo_adubo}
                          onChange={(e) =>
                            updateAdubForm(
                              plantio.id_plantio,
                              "tipo_adubo",
                              e.target.value
                            )
                          }
                          className="h-8 text-xs border-green-200 focus-visible:ring-green-400 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-600">
                          Quantidade (kg)
                        </Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Ex: 50"
                          value={adubForm.quantidade}
                          onChange={(e) =>
                            updateAdubForm(
                              plantio.id_plantio,
                              "quantidade",
                              e.target.value
                            )
                          }
                          className="h-8 text-xs border-green-200 focus-visible:ring-green-400 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={submittingAdub === plantio.id_plantio}
                        onClick={() => handleAddAdubacao(plantio.id_plantio)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 gap-1.5"
                      >
                        {submittingAdub === plantio.id_plantio ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        Registrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Add Plantio Modal ── */}
      <Dialog open={showAddModal} onOpenChange={(o) => !o && setShowAddModal(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Iniciar Novo Ciclo de Plantio</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Propriedade <span className="text-red-500">*</span>
                </Label>
                <select
                  value={plantioForm.id_propriedade}
                  onChange={(e) =>
                    setPlantioForm((p) => ({
                      ...p,
                      id_propriedade: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-green-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Selecione...</option>
                  {properties.map((p) => (
                    <option key={p.id_propriedade} value={p.id_propriedade}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>
                  Espécie <span className="text-red-500">*</span>
                </Label>
                <select
                  value={plantioForm.id_especie}
                  onChange={(e) =>
                    setPlantioForm((p) => ({
                      ...p,
                      id_especie: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-green-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Selecione...</option>
                  {species.map((s) => (
                    <option key={s.id_especie} value={s.id_especie}>
                      {s.nome_popular}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Data de início <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={plantioForm.data_inicio}
                  onChange={(e) =>
                    setPlantioForm((p) => ({
                      ...p,
                      data_inicio: e.target.value,
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Previsão de colheita <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={plantioForm.previsao_colheita}
                  onChange={(e) =>
                    setPlantioForm((p) => ({
                      ...p,
                      previsao_colheita: e.target.value,
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Área plantada (ha) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 2.5"
                  value={plantioForm.area_plantada}
                  onChange={(e) =>
                    setPlantioForm((p) => ({
                      ...p,
                      area_plantada: e.target.value,
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Talhão</Label>
                <Input
                  placeholder="Ex: Talhão A"
                  value={plantioForm.talhao}
                  onChange={(e) =>
                    setPlantioForm((p) => ({
                      ...p,
                      talhao: e.target.value,
                    }))
                  }
                  className="border-green-200 focus-visible:ring-green-400"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={submittingPlantio}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddPlantio}
              disabled={submittingPlantio}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {submittingPlantio && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Iniciar Ciclo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
