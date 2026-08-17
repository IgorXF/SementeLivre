import { NextResponse } from "next/server";
import { db } from "@/lib/store";

const sleep = () => new Promise((r) => setTimeout(r, 400));

export async function GET() {
  await sleep();
  return NextResponse.json(db.plantios);
}
