"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, MapPin, Users } from "lucide-react";
import type { Comunidade } from "@/lib/types";

export default function AdminComunidadesPage() {
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/comunidades")
      .then((r) => r.json())
      .then(setComunidades)
      .catch(() => toast.error("Erro ao carregar comunidades."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comunidades</h1>
        <p className="text-gray-500 text-sm mt-1">
          {comunidades.length} comunidade{comunidades.length !== 1 ? "s" : ""}{" "}
          registrada{comunidades.length !== 1 ? "s" : ""} na plataforma.
        </p>
      </div>

      {comunidades.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-dashed border-gray-200 gap-3">
          <Users className="w-10 h-10 text-gray-200" />
          <p className="text-gray-400 text-sm">Nenhuma comunidade ainda.</p>
        </div>
      )}

      <div className="space-y-3">
        {comunidades.map((c, i) => (
          <div
            key={c.id_comunidade}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4"
          >
            <span className="w-9 h-9 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">{c.nome}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {c.localizacao}
              </p>
            </div>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                c.status === "ativa"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {c.status === "ativa" ? "Ativa" : "Inativa"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
