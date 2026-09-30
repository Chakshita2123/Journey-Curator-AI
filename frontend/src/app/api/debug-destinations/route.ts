import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const csvPath = path.resolve(process.cwd(), "../data/indian_tourist_places_dataset.csv");
    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    
    const destMap = new Map<string, any>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(",");
      if (parts.length < 7) continue;
      const place_id = parts[1];
      const place_name = parts[2];
      const city = parts[3];
      const state = parts[4];
      const category = parts[5];
      const lat = parseFloat(parts[6]);
      const lng = parseFloat(parts[7]);

      if (place_name && !destMap.has(place_name)) {
        destMap.set(place_name, {
          place_id,
          place_name,
          city,
          state,
          category,
          lat: isNaN(lat) ? null : lat,
          lng: isNaN(lng) ? null : lng,
        });
      }
    }

    const destinations = Array.from(destMap.values());
    
    // Write to frontend/src/data/extracted_destinations.json
    const outPath = path.resolve(process.cwd(), "src/data/extracted_destinations.json");
    fs.writeFileSync(outPath, JSON.stringify(destinations, null, 2), "utf-8");

    return NextResponse.json({
      count: destinations.length,
      destinations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
