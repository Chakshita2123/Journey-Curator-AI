import { NextResponse } from "next/server";
import { getAllDatasetDestinations } from "@/lib/destinations";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const list = getAllDatasetDestinations();
    const outPath = path.resolve(process.cwd(), "src/data/rawDestinations.json");
    fs.writeFileSync(outPath, JSON.stringify(list, null, 2), "utf-8");
    return NextResponse.json({ success: true, count: list.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}