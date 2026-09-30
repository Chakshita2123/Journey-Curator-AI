import { NextResponse } from "next/server";
import { getAllDatasetDestinations } from "../all-destinations/route";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const list = getAllDatasetDestinations();
    
    // Generate TypeScript file
    let tsContent = `// ─── 74 Curated Destinations from indian_tourist_places_dataset.csv ─────────\n`;
    tsContent += `export interface DestinationRecord {\n`;
    tsContent += `  id: string;\n`;
    tsContent += `  place_name: string;\n`;
    tsContent += `  city: string;\n`;
    tsContent += `  state: string;\n`;
    tsContent += `  category: string;\n`;
    tsContent += `  latitude: number | null;\n`;
    tsContent += `  longitude: number | null;\n`;
    tsContent += `  user_rating: number;\n`;
    tsContent += `  entry_fee_inr: number;\n`;
    tsContent += `  season: string;\n`;
    tsContent += `  travel_type: string;\n`;
    tsContent += `}\n\n`;
    tsContent += `export const DATASET_DESTINATIONS: DestinationRecord[] = ${JSON.stringify(list, null, 2)};\n`;

    const outPath = path.resolve(process.cwd(), "src/data/allDestinationsData.ts");
    fs.writeFileSync(outPath, tsContent, "utf-8");

    return NextResponse.json({
      success: true,
      count: list.length,
      names: list.map(d => d.place_name),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
