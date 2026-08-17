import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ── GET /api/trips — list all trips for the current user ──────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("journey_curator");
    const trips = await db
      .collection("saved_trips")
      .find({ userId: session.user.id })
      .sort({ savedAt: -1 })
      .toArray();

    return NextResponse.json({
      trips: trips.map((trip) => ({
        ...trip,
        _id: trip._id.toString(),
      })),
    });
  } catch (error) {
    console.error("[trips GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load saved trips." },
      { status: 500 }
    );
  }
}

// ── POST /api/trips — save a new trip ─────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      destination,
      startDate,
      endDate,
      duration,
      persona,
      groupSize,
      costPrediction,
      itinerary,
      recommendations,
    } = body;

    if (!destination || !itinerary) {
      return NextResponse.json(
        { error: "Destination and itinerary are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("journey_curator");

    const tripDoc = {
      userId: session.user.id,
      destination,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      duration: duration ?? itinerary.length,
      persona: persona ?? null,
      groupSize: groupSize ?? 1,
      costPrediction: costPrediction ?? null,
      itinerary,
      recommendations: recommendations ?? null,
      savedAt: new Date(),
    };

    const result = await db.collection("saved_trips").insertOne(tripDoc);

    return NextResponse.json(
      {
        success: true,
        tripId: result.insertedId.toString(),
        message: "Trip saved successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[trips POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save trip." },
      { status: 500 }
    );
  }
}
