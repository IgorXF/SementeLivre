import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET() {
  await sleep();
  return NextResponse.json(db.plantios);
}

export async function POST(request: Request) {
  await sleep();

  const body = await request.json();

  // Mock foreign-key integrity checks
  const propExists = db.properties.some(
    (p) => p.id_propriedade === body.id_propriedade
  );
  if (!propExists) {
    return NextResponse.json(
      { error: "Propriedade não encontrada." },
      { status: 422 }
    );
  }

  const especieExists = db.species.some(
    (s) => s.id_especie === body.id_especie
  );
  if (!especieExists) {
    return NextResponse.json(
      { error: "Espécie não encontrada no catálogo." },
      { status: 422 }
    );
  }

  const newPlantio = {
    id_plantio: randomUUID(),
    id_propriedade: String(body.id_propriedade),
    id_especie: String(body.id_especie),
    data_inicio: String(body.data_inicio),
    previsao_colheita: String(body.previsao_colheita),
    area_plantada: Number(body.area_plantada),
    talhao: String(body.talhao ?? ""),
    status: "ativo" as const,
  };

  db.plantios.push(newPlantio);
  return NextResponse.json(newPlantio, { status: 201 });
}

export async function PUT(request: Request) {
  await sleep();

  const body = await request.json();
  const index = db.plantios.findIndex(
    (p) => p.id_plantio === body.id_plantio
  );

  if (index === -1) {
    return NextResponse.json(
      { error: "Plantio não encontrado." },
      { status: 404 }
    );
  }

  db.plantios[index] = { ...db.plantios[index], ...body };
  return NextResponse.json(db.plantios[index]);
}

export async function DELETE(request: NextRequest) {
  await sleep();

  const id = request.nextUrl.searchParams.get("id_plantio");
  if (!id) {
    return NextResponse.json(
      { error: "id_plantio é obrigatório." },
      { status: 400 }
    );
  }

  const index = db.plantios.findIndex((p) => p.id_plantio === id);
  if (index === -1) {
    return NextResponse.json(
      { error: "Plantio não encontrado." },
      { status: 404 }
    );
  }

  db.plantios.splice(index, 1);
  // Also clean up related adubacoes
  db.adubacoes = db.adubacoes.filter((a) => a.id_plantio !== id);
  return NextResponse.json({ success: true });
}
