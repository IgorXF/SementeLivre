import { NextResponse } from "next/server";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

const ADMIN_EMAIL = "adm@gmail.com";
const ADMIN_PASSWORD = "adm1234";

export async function POST(request: Request) {
  await sleep();

  const { email, senha } = await request.json();

  // ── Admin ──────────────────────────────────────────────────────────────
  if (email === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
    return NextResponse.json({
      email,
      nome: "Administrador",
      role: "admin",
    });
  }

  // ── Producer account ───────────────────────────────────────────────────
  const conta = db.contasProdutores.find(
    (c) => c.email === email && c.senha === senha
  );

  if (conta) {
    const comunidade = db.comunidades.find(
      (c) => c.id_comunidade === conta.id_comunidade
    );
    return NextResponse.json({
      email: conta.email,
      nome: conta.nome,
      role: "produtor",
      id_comunidade: conta.id_comunidade,
      nome_comunidade: comunidade?.nome ?? "",
    });
  }

  return NextResponse.json(
    { error: "Email ou senha incorretos." },
    { status: 401 }
  );
}
