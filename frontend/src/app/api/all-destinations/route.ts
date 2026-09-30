import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface DestinationItem {
  place_id: string;
  place_name: string;
  city: string;
  state: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  user_rating: number;
  entry_fee_inr: number;
  season: string;
  travel_type: string;
}

export function getAllDatasetDestinations(): DestinationItem[] {
  const csvPath = path.resolve(process.cwd(), "../data/indian_tourist_places_dataset.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at: ${csvPath}`);
  }
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);

  const destMap = new Map<string, {
    place_id: string;
    place_name: string;
    city: string;
    state: string;
    category: string;
    latitude: number | null;
    longitude: number | null;
    ratings: number[];
    entry_fee: number;
    seasons: string[];
    travel_types: string[];
  }>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // CSV parser handling quoted strings if any
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    if (parts.length < 8) continue;
    // row_id,place_id,place_name,city,state,category,latitude,longitude,...
    const place_id = parts[1];
    const place_name = parts[2];
    const city = parts[3];
    const state = parts[4];
    const category = parts[5];
    const lat = parseFloat(parts[6]);
    const lng = parseFloat(parts[7]);
    const season = parts[14] || "Winter";
    const user_rating = parseFloat(parts[21]);
    const entry_fee_inr = parseFloat(parts[28]);
    const travel_type = parts[30] || "Family";

    if (!place_name) continue;

    if (!destMap.has(place_name)) {
      destMap.set(place_name, {
        place_id,
        place_name,
        city,
        state,
        category,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        ratings: isNaN(user_rating) ? [4.5] : [user_rating],
        entry_fee: isNaN(entry_fee_inr) ? 0 : entry_fee_inr,
        seasons: [season],
        travel_types: [travel_type],
      });
    } else {
      const existing = destMap.get(place_name)!;
      if (!isNaN(user_rating)) existing.ratings.push(user_rating);
      if (season) existing.seasons.push(season);
      if (travel_type) existing.travel_types.push(travel_type);
    }
  }

  const results: DestinationItem[] = [];
  for (const [name, d] of destMap.entries()) {
    const avgRating = d.ratings.length > 0
      ? d.ratings.reduce((a, b) => a + b, 0) / d.ratings.length
      : 4.5;
    
    // mode season
    const seasonCounts: Record<string, number> = {};
    d.seasons.forEach((s) => { seasonCounts[s] = (seasonCounts[s] || 0) + 1; });
    const bestSeason = Object.keys(seasonCounts).sort((a, b) => seasonCounts[b] - seasonCounts[a])[0] || "Winter";

    // mode travel_type
    const typeCounts: Record<string, number> = {};
    d.travel_types.forEach((t) => { typeCounts[t] = (typeCounts[t] || 0) + 1; });
    const bestTravelType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0] || "Family";

    results.push({
      place_id: d.place_id,
      place_name: name,
      city: d.city,
      state: d.state,
      category: d.category,
      latitude: d.latitude,
      longitude: d.longitude,
      user_rating: parseFloat(avgRating.toFixed(1)),
      entry_fee_inr: d.entry_fee,
      season: bestSeason,
      travel_type: bestTravelType,
    });
  }

  // Sort by place_name
  results.sort((a, b) => a.place_name.localeCompare(b.place_name));
  return results;
}

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
