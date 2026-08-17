import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET() {
  await sleep();
  return NextResponse.json(db.properties);
}

export async function POST(request: Request) {
  await sleep();

  const body = (await request.json()) as {
    nome: string;
    endereco: string;
    area_total: number;
  };

  const newProperty = {
    id_propriedade: randomUUID(),
    nome: body.nome,
    endereco: body.endereco,
    area_total: Number(body.area_total),
  };

  db.properties.push(newProperty);
  return NextResponse.json(newProperty, { status: 201 });
}

export async function PUT(request: Request) {
  await sleep();

  const body = (await request.json()) as {
    id_propriedade: string;
    nome?: string;
    endereco?: string;
    area_total?: number;
  };

  const index = db.properties.findIndex(
    (p) => p.id_propriedade === body.id_propriedade
  );

  if (index === -1) {
    return NextResponse.json(
      { error: "Propriedade não encontrada." },
      { status: 404 }
    );
  }

  db.properties[index] = {
    ...db.properties[index],
    nome: body.nome ?? db.properties[index].nome,
    endereco: body.endereco ?? db.properties[index].endereco,
    area_total:
      body.area_total != null
        ? Number(body.area_total)
        : db.properties[index].area_total,
  };

  return NextResponse.json(db.properties[index]);
}

export async function DELETE(request: NextRequest) {
  await sleep();

  const id_propriedade = request.nextUrl.searchParams.get("id_propriedade");

  if (!id_propriedade) {
    return NextResponse.json(
      { error: "id_propriedade é obrigatório." },
      { status: 400 }
    );
  }

  const index = db.properties.findIndex(
    (p) => p.id_propriedade === id_propriedade
  );

  if (index === -1) {
    return NextResponse.json(
      { error: "Propriedade não encontrada." },
      { status: 404 }
    );
  }

  // Dependency check: block if property has active crop cycles
  const hasActivePlantio = db.plantios.some(
    (p) => p.id_propriedade === id_propriedade && p.status === "ativo"
  );

  if (hasActivePlantio) {
    return NextResponse.json(
      {
        error:
          "Esta propriedade possui cultivos ativos e não pode ser removida.",
      },
      { status: 400 }
    );
  }

  db.properties.splice(index, 1);
  return NextResponse.json({ success: true });
}
