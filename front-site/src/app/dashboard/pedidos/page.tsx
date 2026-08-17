"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import type { Pedido, Species, Notificacao, StatusPedido } from "@/lib/types";

type FilterPedido = StatusPedido | "all";

const STATUS_BADGE: Record<StatusPedido, { label: string; className: string }> = {
  PENDENTE: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  CONFIRMADO: { label: "Confirmado", className: "bg-green-100 text-green-700 border-green-200" },
  CANCELADO: { label: "Cancelado", className: "bg-red-100 text-red-600 border-red-200" },
};

const TIPO_LABEL: Record<string, string> = {
  VENDA: "Venda",
  TROCA: "Troca",
  DOACAO: "Doação",
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterPedido>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const user = getAuthUser();
  const id_comunidade = user?.id_comunidade ?? "";

  useEffect(() => {
    if (!id_comunidade) return;

    Promise.all([
      fetch(`/api/pedidos?id_comunidade=${id_comunidade}`).then((r) => r.json()),
      fetch("/api/catalog").then((r) => r.json()),
      fetch(`/api/notificacoes?id_comunidade=${id_comunidade}`).then((r) => r.json()),
    ])
      .then(([ped, sps, notifs]: [Pedido[], Species[], Notificacao[]]) => {
        setPedidos(ped);
        setSpecies(sps);
        // Mark all unread notifications as read
        const unread = notifs.filter((n) => !n.lida);
        unread.forEach((n) => {
          fetch("/api/notificacoes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_notificacao: n.id_notificacao }),
          }).catch(() => {});
        });
      })
      .catch(() => toast.error("Erro ao carregar pedidos."))
      .finally(() => setLoading(false));
  }, [id_comunidade]);

  function getNomeEspecie(id_especie: string) {
    return species.find((s) => s.id_especie === id_especie)?.nome_popular ?? id_especie;
  }

  async function updateStatus(id_pedido: string, status: "CONFIRMADO" | "CANCELADO") {
    setActionLoading(id_pedido + status);
    try {
      const res = await fetch("/api/pedidos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pedido, status }),
      });
      if (!res.ok) throw new Error();
      const updated: Pedido = await res.json();
      setPedidos((p) => p.map((ped) => (ped.id_pedido === updated.id_pedido ? updated : ped)));
      toast.success(
        status === "CONFIRMADO" ? "Pedido confirmado!" : "Pedido cancelado."
      );
    } catch {
      toast.error("Erro ao atualizar pedido.");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = pedidos.filter(
    (p) => filter === "all" || p.status === filter
  );

  const pendingCount = pedidos.filter((p) => p.status === "PENDENTE").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Pedidos Recebidos</h1>
            {pendingCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} no total.
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "PENDENTE", "CONFIRMADO", "CANCELADO"] as FilterPedido[]).map((f) => {
          const label =
            f === "all"
              ? "Todos"
              : STATUS_BADGE[f as StatusPedido].label;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === f
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-52 bg-white rounded-2xl border border-dashed border-green-200 gap-3">
          <ShoppingBag className="w-10 h-10 text-green-200" />
          <p className="text-gray-500 text-sm">Nenhum pedido encontrado.</p>
        </div>
      )}

      {/* Table-like list */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((pedido) => {
            const statusCfg = STATUS_BADGE[pedido.status];
            return (
              <div
                key={pedido.id_pedido}
                className="bg-white border border-green-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm"
              >
                {/* Info */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm truncate">
                      {getNomeEspecie(pedido.id_especie)}
                    </span>
                    <Badge variant="outline" className={`text-[11px] ${statusCfg.className}`}>
                      {statusCfg.label}
                    </Badge>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {TIPO_LABEL[pedido.tipoPedido] ?? pedido.tipoPedido}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>{pedido.nomeRecebedor}</strong> · {pedido.contatoRecebedor}
                  </p>
                  <p className="text-xs text-gray-500">
                    Quantidade: <strong>{pedido.quantidade}</strong> ·{" "}
                    {new Date(pedido.dataPedido).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {pedido.mensagemOpcional && (
                    <p className="text-xs text-gray-400 italic truncate">
                      &ldquo;{pedido.mensagemOpcional}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                {pedido.status === "PENDENTE" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-3"
                      disabled={actionLoading !== null}
                      onClick={() => updateStatus(pedido.id_pedido, "CONFIRMADO")}
                    >
                      {actionLoading === pedido.id_pedido + "CONFIRMADO" && (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      )}
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8 px-3"
                      disabled={actionLoading !== null}
                      onClick={() => updateStatus(pedido.id_pedido, "CANCELADO")}
                    >
                      {actionLoading === pedido.id_pedido + "CANCELADO" && (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      )}
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
