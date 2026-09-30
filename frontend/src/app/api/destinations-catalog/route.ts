import { NextResponse } from "next/server";
import { getAllDatasetDestinations } from "../all-destinations/route";
import { getVerifiedDestinationImage, DESTINATION_IMAGES, CATEGORY_FALLBACK_IMAGES } from "@/data/destinationImages";

export async function GET() {
  try {
    const dataset = getAllDatasetDestinations();
    
    const enriched = dataset.map((dest) => {
      const image = getVerifiedDestinationImage(dest.place_name, dest.category);
      const isSpecific = Boolean(DESTINATION_IMAGES[dest.place_name]);
      return {
        ...dest,
        image,
        isSpecific,
      };
    });

    const missingSpecific = enriched.filter(e => !e.isSpecific);

    return NextResponse.json({
      total: enriched.length,
      specificCount: enriched.length - missingSpecific.length,
      missingCount: missingSpecific.length,
      missingNames: missingSpecific.map(m => m.place_name),
      destinations: enriched,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
