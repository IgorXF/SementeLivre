import { NextResponse } from "next/server";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET() {
  await sleep();
  // Never expose senha to the client
  const { senha: _omit, ...publicData } = db.proprietario;
  return NextResponse.json(publicData);
}

export async function PUT(request: Request) {
  await sleep();

  const body = (await request.json()) as {
    nome?: string;
    telefone?: string;
    cpf?: string;
    senha_atual?: string;
    nova_senha?: string;
  };

  // Password change requested — verify current password first
  if (body.nova_senha) {
    if (!body.senha_atual || body.senha_atual !== db.proprietario.senha) {
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 401 }
      );
    }
    db.proprietario.senha = body.nova_senha;
  }

  if (body.nome) db.proprietario.nome = body.nome;
  if (body.telefone) db.proprietario.telefone = body.telefone;
  if (body.cpf) db.proprietario.cpf = body.cpf;

  const { senha: _omit, ...publicData } = db.proprietario;
  return NextResponse.json(publicData);
}
