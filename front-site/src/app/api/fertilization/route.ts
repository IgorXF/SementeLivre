import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET(request: NextRequest) {
  await sleep();
  const id_plantio = request.nextUrl.searchParams.get("id_plantio");
  if (id_plantio) {
    return NextResponse.json(
      db.adubacoes.filter((a) => a.id_plantio === id_plantio)
    );
  }
  return NextResponse.json(db.adubacoes);
}

export async function POST(request: Request) {
  await sleep();

  const body = await request.json();

  const plantioExists = db.plantios.some(
    (p) => p.id_plantio === body.id_plantio
  );
  if (!plantioExists) {
    return NextResponse.json(
      { error: "Plantio não encontrado." },
      { status: 422 }
    );
  }

  const newAdubacao = {
    id_adubacao: randomUUID(),
    id_plantio: String(body.id_plantio),
    data_adubacao: String(body.data_adubacao),
    tipo_adubo: String(body.tipo_adubo),
    quantidade: Number(body.quantidade),
  };

  db.adubacoes.push(newAdubacao);
  return NextResponse.json(newAdubacao, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  await sleep();

  const id = request.nextUrl.searchParams.get("id_adubacao");
  if (!id) {
    return NextResponse.json(
      { error: "id_adubacao é obrigatório." },
      { status: 400 }
    );
  }

  const index = db.adubacoes.findIndex((a) => a.id_adubacao === id);
  if (index === -1) {
    return NextResponse.json(
      { error: "Registro de adubação não encontrado." },
      { status: 404 }
    );
  }

  db.adubacoes.splice(index, 1);
  return NextResponse.json({ success: true });
}
