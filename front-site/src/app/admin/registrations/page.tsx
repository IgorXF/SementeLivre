"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  MapPin,
  User,
  Mail,
  Clock,
} from "lucide-react";
import type { SolicitacaoCadastro, StatusSolicitacao } from "@/lib/types";

const STATUS_CFG: Record<
  StatusSolicitacao,
  { label: string; className: string }
> = {
  pendente: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  aprovada: {
    label: "Aprovada",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  rejeitada: {
    label: "Rejeitada",
    className: "bg-red-100 text-red-600 border-red-200",
  },
};

type FilterStatus = StatusSolicitacao | "all";

export default function AdminRegistrationsPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pendente");
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Reject dialog
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    id: string;
    nome: string;
  }>({ open: false, id: "", nome: "" });
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    fetch("/api/registrations")
      .then((r) => r.json())
      .then(setSolicitacoes)
      .catch(() => toast.error("Erro ao carregar solicitações."))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = solicitacoes.filter(
    (s) => s.status === "pendente"
  ).length;
  const filtered =
    filter === "all"
      ? solicitacoes
      : solicitacoes.filter((s) => s.status === filter);

  function openDocument(sol: SolicitacaoCadastro) {
    if (!sol.documento_base64) {
      toast.info("Nenhum documento disponível para esta solicitação.");
      return;
    }
    const byteChars = atob(sol.documento_base64);
    const byteNums = Array.from(byteChars, (c) => c.charCodeAt(0));
    const bytes = new Uint8Array(byteNums);
    const ext = sol.documento_nome.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };
    const mime = mimeMap[ext ?? "pdf"] ?? "application/octet-stream";
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  async function handleApprove(sol: SolicitacaoCadastro) {
    setSubmitting(sol.id_solicitacao);
    try {
      const res = await fetch("/api/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_solicitacao: sol.id_solicitacao,
          action: "aprovar",
        }),
      });
      const updated: SolicitacaoCadastro = await res.json();
      setSolicitacoes((p) =>
        p.map((s) =>
          s.id_solicitacao === updated.id_solicitacao ? updated : s
        )
      );
      toast.success(
        `Comunidade "${sol.nome_comunidade}" aprovada! Conta criada para ${sol.nome_responsavel}.`
      );
    } catch {
      toast.error("Erro ao aprovar solicitação.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleReject() {
    if (!observacao.trim()) {
      toast.error("Informe o motivo da rejeição.");
      return;
    }
    setSubmitting(rejectModal.id);
    try {
      const res = await fetch("/api/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_solicitacao: rejectModal.id,
          action: "rejeitar",
          observacao,
        }),
      });
      const updated: SolicitacaoCadastro = await res.json();
      setSolicitacoes((p) =>
        p.map((s) =>
          s.id_solicitacao === updated.id_solicitacao ? updated : s
        )
      );
      toast.success("Solicitação rejeitada.");
      setRejectModal({ open: false, id: "", nome: "" });
      setObservacao("");
    } catch {
      toast.error("Erro ao rejeitar solicitação.");
    } finally {
      setSubmitting(null);
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
    <div className="space-y-6 max-w-4xl">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Solicitações de Cadastro
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {pendingCount > 0 ? (
            <span className="text-amber-600 font-medium">
              {pendingCount} solicitaç{pendingCount > 1 ? "ões" : "ão"} pendente{pendingCount > 1 ? "s" : ""} aguardando análise.
            </span>
          ) : (
            "Nenhuma solicitação pendente."
          )}
        </p>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["pendente", "aprovada", "rejeitada", "all"] as FilterStatus[]).map(
          (f) => {
            const label =
              f === "all"
                ? "Todas"
                : STATUS_CFG[f as StatusSolicitacao].label;
            const count =
              f === "all"
                ? solicitacoes.length
                : solicitacoes.filter((s) => s.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filter === f
                    ? "bg-white shadow text-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                <span className="text-[10px] bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 font-bold">
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-dashed border-gray-200 gap-3">
          <Clock className="w-10 h-10 text-gray-200" />
          <p className="text-gray-400 text-sm">
            Nenhuma solicitação nesta categoria.
          </p>
        </div>
      )}

      {/* ── List ── */}
      <div className="space-y-3">
        {filtered.map((sol) => {
          const cfg = STATUS_CFG[sol.status];
          return (
            <div
              key={sol.id_solicitacao}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 text-base">
                      {sol.nome_comunidade}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium ${cfg.className}`}
                    >
                      {cfg.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {sol.nome_responsavel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {sol.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {sol.localizacao}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {sol.data_solicitacao}
                    </span>
                  </div>

                  {sol.observacao && (
                    <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-1.5">
                      Motivo da rejeição: {sol.observacao}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 gap-1.5 text-xs h-8"
                    onClick={() => openDocument(sol)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {sol.documento_nome
                      ? sol.documento_nome.substring(0, 20) +
                        (sol.documento_nome.length > 20 ? "…" : "")
                      : "Documento"}
                  </Button>

                  {sol.status === "pendente" && (
                    <>
                      <Button
                        size="sm"
                        disabled={submitting === sol.id_solicitacao}
                        onClick={() => handleApprove(sol)}
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs h-8"
                      >
                        {submitting === sol.id_solicitacao ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={submitting === sol.id_solicitacao}
                        onClick={() =>
                          setRejectModal({
                            open: true,
                            id: sol.id_solicitacao,
                            nome: sol.nome_comunidade,
                          })
                        }
                        className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 text-xs h-8"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Reject dialog ── */}
      <Dialog
        open={rejectModal.open}
        onOpenChange={(o) =>
          !o && setRejectModal({ open: false, id: "", nome: "" })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeitar solicitação</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              Informe o motivo da rejeição de{" "}
              <strong>{rejectModal.nome}</strong>. Este texto será registrado.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="observacao">Motivo da rejeição</Label>
              <textarea
                id="observacao"
                rows={4}
                placeholder="Ex: Documentação incompleta ou inválida..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setRejectModal({ open: false, id: "", nome: "" })
              }
              disabled={!!submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={!!submitting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
