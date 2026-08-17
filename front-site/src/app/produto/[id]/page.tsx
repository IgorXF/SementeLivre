"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import PublicHeader from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Leaf, FlaskConical, BookOpen, ArrowLeft } from "lucide-react";
import type { Species, SpeciesStatus, Comunidade, TipoSemente, TipoPedido } from "@/lib/types";

const STATUS_CONFIG: Record<SpeciesStatus, { label: string; className: string }> = {
  exchange: { label: "Para Troca", className: "bg-blue-100 text-blue-700 border-blue-200" },
  sale: { label: "Para Venda", className: "bg-green-100 text-green-700 border-green-200" },
  donation: { label: "Para Doação", className: "bg-purple-100 text-purple-700 border-purple-200" },
  unavailable: { label: "Indisponível", className: "bg-gray-100 text-gray-400 border-gray-200" },
};

const TIPO_LABEL: Record<TipoSemente, string> = {
  HORTALICA: "Hortaliça",
  FRUTIFERA: "Frutífera",
  FORRAGEIRA: "Forrageira",
  CEREAL: "Cereal",
  LEGUMINOSA: "Leguminosa",
  OUTRAS: "Outras",
};

const emptyForm = {
  quantidade: 1,
  tipoPedido: "VENDA" as TipoPedido,
  nomeRecebedor: "",
  contatoRecebedor: "",
  mensagemOpcional: "",
};

export default function ProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [species, setSpecies] = useState<Species | null>(null);
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([
      fetch("/api/catalog").then((r) => r.json()),
      fetch("/api/comunidades").then((r) => r.json()),
    ])
      .then(([sps, cms]: [Species[], Comunidade[]]) => {
        const found = sps.find((s) => s.id_especie === id);
        setSpecies(found ?? null);
        setComunidades(cms);
      })
      .catch(() => toast.error("Erro ao carregar produto."))
      .finally(() => setLoading(false));
  }, [id]);

  function getNomeComunidade(cid?: string) {
    return comunidades.find((c) => c.id_comunidade === cid)?.nome ?? "—";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!species) return;
    if (!form.nomeRecebedor || !form.contatoRecebedor) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_especie: species.id_especie,
          id_comunidade: species.id_comunidade,
          tipoPedido: form.tipoPedido,
          nomeRecebedor: form.nomeRecebedor,
          contatoRecebedor: form.contatoRecebedor,
          mensagemOpcional: form.mensagemOpcional,
          quantidade: form.quantidade,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Pedido enviado! Aguarde o retorno do produtor.");
      router.push("/");
    } catch {
      toast.error("Erro ao enviar pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Leaf className="w-16 h-16 text-green-200" />
          <p className="text-gray-500">Produto não encontrado.</p>
          <Link href="/">
            <Button variant="outline" className="gap-2 border-green-200 text-green-700">
              <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[species.status];
  const unavailable = species.status === "unavailable";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
        </Link>

        {/* ── Product detail ── */}
        <Card className="border-green-100">
          <div className="flex flex-col md:flex-row gap-6 p-6">
            {/* Photo */}
            <div className="md:w-64 flex-shrink-0 h-48 md:h-auto rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
              {species.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={species.foto} alt={species.nome_popular} className="h-full w-full object-cover" />
              ) : (
                <Leaf className="w-20 h-20 text-green-300" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{species.nome_popular}</h1>
                <Badge variant="outline" className={`${statusCfg.className} text-sm`}>
                  {statusCfg.label}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <em>{species.nome_cientifico || "—"}</em>
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {species.familia_botanica || "—"}
                </span>
              </div>

              {species.tipoSemente && (
                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200">
                  {TIPO_LABEL[species.tipoSemente]}
                </span>
              )}

              <p className="text-xs text-green-600 font-medium">
                🌿 {getNomeComunidade(species.id_comunidade)}
              </p>

              <div className="flex gap-4 flex-wrap text-sm">
                {species.quantidadeEstoque != null && (
                  <span className="text-gray-700 font-medium">
                    📦 {species.quantidadeEstoque} {species.unidadePesagem ?? "unid."} em estoque
                  </span>
                )}
                {species.preco != null && (
                  <span className="text-green-700 font-bold text-base">
                    R$ {species.preco.toFixed(2)}/{species.unidadePesagem ?? "unid."}
                  </span>
                )}
              </div>

              {species.descricao && (
                <p className="text-sm text-gray-600 leading-relaxed">{species.descricao}</p>
              )}
            </div>
          </div>
        </Card>

        {/* ── Negotiation form or unavailable ── */}
        {unavailable ? (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="py-10 flex flex-col items-center gap-4">
              <p className="text-gray-500 text-center">
                Este produto está temporariamente indisponível para negociação.
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2 border-green-200 text-green-700">
                  <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Fazer pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tipoPedido">Tipo de negociação</Label>
                    <select
                      id="tipoPedido"
                      value={form.tipoPedido}
                      onChange={(e) => setForm((p) => ({ ...p, tipoPedido: e.target.value as TipoPedido }))}
                      className="w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <option value="VENDA">Venda</option>
                      <option value="TROCA">Troca</option>
                      <option value="DOACAO">Doação</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min={1}
                      value={form.quantidade}
                      onChange={(e) => setForm((p) => ({ ...p, quantidade: Number(e.target.value) }))}
                      className="border-green-200 focus-visible:ring-green-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nomeRecebedor">Seu nome <span className="text-red-500">*</span></Label>
                  <Input
                    id="nomeRecebedor"
                    placeholder="Nome completo"
                    value={form.nomeRecebedor}
                    onChange={(e) => setForm((p) => ({ ...p, nomeRecebedor: e.target.value }))}
                    className="border-green-200 focus-visible:ring-green-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contatoRecebedor">Contato (telefone ou e-mail) <span className="text-red-500">*</span></Label>
                  <Input
                    id="contatoRecebedor"
                    placeholder="(11) 99999-9999 ou email@exemplo.com"
                    value={form.contatoRecebedor}
                    onChange={(e) => setForm((p) => ({ ...p, contatoRecebedor: e.target.value }))}
                    className="border-green-200 focus-visible:ring-green-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mensagemOpcional">Mensagem (opcional)</Label>
                  <textarea
                    id="mensagemOpcional"
                    rows={3}
                    placeholder="Informações adicionais, forma de entrega, etc."
                    value={form.mensagemOpcional}
                    onChange={(e) => setForm((p) => ({ ...p, mensagemOpcional: e.target.value }))}
                    className="w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar pedido
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-green-900 text-green-300 text-xs py-5 text-center">
        © {new Date().getFullYear()} Semente Livre. Todos os direitos reservados.
      </footer>
    </div>
  );
}
