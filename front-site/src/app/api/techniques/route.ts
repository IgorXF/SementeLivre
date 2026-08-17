import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET() {
  await sleep();
  return NextResponse.json(db.tecnicas);
}

export async function POST(request: Request) {
  await sleep();

  const body = await request.json();
  const newTecnica = {
    id_tecnica: randomUUID(),
    nome_tecnica: String(body.nome_tecnica ?? ""),
    descricao: String(body.descricao ?? ""),
  };

  db.tecnicas.push(newTecnica);
  return NextResponse.json(newTecnica, { status: 201 });
}

export async function PUT(request: Request) {
  await sleep();

  const body = await request.json();
  const index = db.tecnicas.findIndex(
    (t) => t.id_tecnica === body.id_tecnica
  );

  if (index === -1) {
    return NextResponse.json(
      { error: "Técnica não encontrada." },
      { status: 404 }
    );
  }

  db.tecnicas[index] = { ...db.tecnicas[index], ...body };
  return NextResponse.json(db.tecnicas[index]);
}

export async function DELETE(request: NextRequest) {
  await sleep();

  const id = request.nextUrl.searchParams.get("id_tecnica");
  if (!id) {
    return NextResponse.json(
      { error: "id_tecnica é obrigatório." },
      { status: 400 }
    );
  }

  const index = db.tecnicas.findIndex((t) => t.id_tecnica === id);
  if (index === -1) {
    return NextResponse.json(
      { error: "Técnica não encontrada." },
      { status: 404 }
    );
  }

  db.tecnicas.splice(index, 1);
  return NextResponse.json({ success: true });
}
