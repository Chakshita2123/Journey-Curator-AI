import { NextResponse } from "next/server";
import { getAllDatasetDestinations } from "@/lib/destinations";

export async function GET() {
  try {
    const destinations = getAllDatasetDestinations();
    return NextResponse.json({
      total: destinations.length,
      destinations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}