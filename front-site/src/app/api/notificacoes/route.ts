import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET(request: NextRequest) {
  await sleep();
  const id_comunidade = request.nextUrl.searchParams.get("id_comunidade");
  if (id_comunidade) {
    return NextResponse.json(
      db.notificacoes.filter((n) => n.id_comunidade === id_comunidade)
    );
  }
  return NextResponse.json(db.notificacoes);
}

export async function PUT(request: Request) {
  await sleep();
  const body = await request.json();
  const index = db.notificacoes.findIndex(
    (n) => n.id_notificacao === body.id_notificacao
  );

  if (index === -1) {
    return NextResponse.json(
      { error: "Notificação não encontrada." },
      { status: 404 }
    );
  }

  db.notificacoes[index] = { ...db.notificacoes[index], lida: true };
  return NextResponse.json(db.notificacoes[index]);
}
