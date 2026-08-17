import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET() {
  await sleep();
  return NextResponse.json(db.solicitacoes);
}

export async function POST(request: Request) {
  await sleep();

  const body = await request.json();

  // Prevent duplicate email registrations
  const emailExists =
    db.solicitacoes.some((s) => s.email === body.email) ||
    db.contasProdutores.some((c) => c.email === body.email) ||
    body.email === "adm@gmail.com";

  if (emailExists) {
    return NextResponse.json(
      { error: "Este e-mail já está em uso." },
      { status: 409 }
    );
  }

  const novaSolicitacao = {
    id_solicitacao: randomUUID(),
    nome_responsavel: String(body.nome_responsavel ?? ""),
    email: String(body.email ?? ""),
    senha: String(body.senha ?? ""),
    nome_comunidade: String(body.nome_comunidade ?? ""),
    localizacao: String(body.localizacao ?? ""),
    documento_nome: String(body.documento_nome ?? ""),
    documento_base64: String(body.documento_base64 ?? ""),
    status: "pendente" as const,
    data_solicitacao: new Date().toISOString().split("T")[0],
    observacao: "",
  };

  db.solicitacoes.push(novaSolicitacao);
  return NextResponse.json(novaSolicitacao, { status: 201 });
}

export async function PUT(request: Request) {
  await sleep();

  const body = await request.json();
  const { id_solicitacao, action, observacao } = body as {
    id_solicitacao: string;
    action: "aprovar" | "rejeitar";
    observacao?: string;
  };

  const index = db.solicitacoes.findIndex(
    (s) => s.id_solicitacao === id_solicitacao
  );

  if (index === -1) {
    return NextResponse.json(
      { error: "Solicitação não encontrada." },
      { status: 404 }
    );
  }

  const sol = db.solicitacoes[index];

  if (action === "aprovar") {
    // Create community
    const newComunidade = {
      id_comunidade: randomUUID(),
      nome: sol.nome_comunidade,
      localizacao: sol.localizacao,
      status: "ativa" as const,
    };
    db.comunidades.push(newComunidade);

    // Create producer account
    db.contasProdutores.push({
      id_conta: randomUUID(),
      email: sol.email,
      senha: sol.senha,
      nome: sol.nome_responsavel,
      id_comunidade: newComunidade.id_comunidade,
    });

    db.solicitacoes[index] = { ...sol, status: "aprovada" };
  } else {
    db.solicitacoes[index] = {
      ...sol,
      status: "rejeitada",
      observacao: observacao ?? "",
    };
  }

  return NextResponse.json(db.solicitacoes[index]);
}
