import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ── GET /api/trips/[id] — load a single saved trip ────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid trip ID." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("journey_curator");
    const trip = await db
      .collection("saved_trips")
      .findOne({ _id: new ObjectId(id), userId: session.user.id });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    return NextResponse.json({ trip: { ...trip, _id: trip._id.toString() } });
  } catch (error) {
    console.error("[trips/[id] GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load trip." },
      { status: 500 }
    );
  }
}

// ── DELETE /api/trips/[id] — delete a specific saved trip ─────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid trip ID." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("journey_curator");

    // Verify ownership before deleting
    const result = await db.collection("saved_trips").deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Trip not found or you do not have permission to delete it." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Trip deleted." });
  } catch (error) {
    console.error("[trips/[id] DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete trip." },
      { status: 500 }
    );
  }
}
