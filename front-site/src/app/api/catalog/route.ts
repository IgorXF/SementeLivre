import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET(request: NextRequest) {
  await sleep();
  const id_comunidade = request.nextUrl.searchParams.get("id_comunidade");
  if (id_comunidade) {
    return NextResponse.json(
      db.species.filter((s) => s.id_comunidade === id_comunidade)
    );
  }
  return NextResponse.json(db.species);
}

export async function POST(request: Request) {
  await sleep();

  const body = await request.json();
  const newSpecies = {
    id_especie: randomUUID(),
    nome_popular: String(body.nome_popular ?? ""),
    nome_cientifico: String(body.nome_cientifico ?? ""),
    familia_botanica: String(body.familia_botanica ?? ""),
    descricao: String(body.descricao ?? ""),
    foto: String(body.foto ?? ""),
    status: body.status ?? "unavailable",
    id_comunidade: body.id_comunidade,
    tipoSemente: body.tipoSemente,
    quantidadeEstoque: body.quantidadeEstoque != null ? Number(body.quantidadeEstoque) : undefined,
    pesoEstoque: body.pesoEstoque != null ? Number(body.pesoEstoque) : undefined,
    preco: body.preco != null ? Number(body.preco) : undefined,
    formaPrecificacao: body.formaPrecificacao,
    unidadePesagem: body.unidadePesagem,
  };

  db.species.push(newSpecies);
  return NextResponse.json(newSpecies, { status: 201 });
}

export async function PUT(request: Request) {
  await sleep();

  const body = await request.json();
  const index = db.species.findIndex((s) => s.id_especie === body.id_especie);

  if (index === -1) {
    return NextResponse.json(
      { error: "Espécie não encontrada." },
      { status: 404 }
    );
  }

  db.species[index] = {
    ...db.species[index],
    ...body,
    tipoSemente: body.tipoSemente,
    quantidadeEstoque: body.quantidadeEstoque != null ? Number(body.quantidadeEstoque) : db.species[index].quantidadeEstoque,
    pesoEstoque: body.pesoEstoque != null ? Number(body.pesoEstoque) : db.species[index].pesoEstoque,
    preco: body.preco != null ? Number(body.preco) : db.species[index].preco,
    formaPrecificacao: body.formaPrecificacao,
    unidadePesagem: body.unidadePesagem,
  };
  return NextResponse.json(db.species[index]);
}

export async function DELETE(request: NextRequest) {
  await sleep();

  const id = request.nextUrl.searchParams.get("id_especie");
  if (!id) {
    return NextResponse.json(
      { error: "id_especie é obrigatório." },
      { status: 400 }
    );
  }

  const index = db.species.findIndex((s) => s.id_especie === id);
  if (index === -1) {
    return NextResponse.json(
      { error: "Espécie não encontrada." },
      { status: 404 }
    );
  }

  // Dependency checks across three domains
  const dependencies: string[] = [];

  const activePlantios = db.plantios.filter(
    (p) => p.id_especie === id && p.status === "ativo"
  );
  if (activePlantios.length > 0) {
    dependencies.push(
      `Plantios ativos: ${activePlantios.map((p) => p.id_plantio).join(", ")}`
    );
  }

  const estoqueItems = db.estoque.filter((e) => e.id_especie === id);
  if (estoqueItems.length > 0) {
    dependencies.push(
      `Itens em estoque: ${estoqueItems.map((e) => e.id_estoque).join(", ")}`
    );
  }

  const colheitaItems = db.colheitas.filter((c) => c.id_especie === id);
  if (colheitaItems.length > 0) {
    dependencies.push(
      `Colheitas registradas: ${colheitaItems.map((c) => c.id_colheita).join(", ")}`
    );
  }

  if (dependencies.length > 0) {
    return NextResponse.json(
      {
        error:
          "Esta espécie possui dependências ativas e não pode ser removida.",
        dependencies,
      },
      { status: 422 }
    );
  }

  db.species.splice(index, 1);
  return NextResponse.json({ success: true });
}
