import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Persona classification has been removed from product scope." },
    { status: 410 }
  );
}
