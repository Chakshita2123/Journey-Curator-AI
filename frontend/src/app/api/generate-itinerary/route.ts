import { NextRequest, NextResponse } from "next/server";
import type { ItineraryRequest, ItineraryResponse, ItineraryDay } from "@/types/api";

// ── Environment config ────────────────────────────────────────────────────────
const GEMINI_KEY  = process.env.GEMINI_API_KEY;
// Gemini 1.5 Flash — fast, generous free quota, great for structured JSON output
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

const GROQ_KEY   = process.env.GROQ_API_KEY;
// llama-3.1-8b-instant — Groq's fastest model, very low latency
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

// ── JSON helpers ──────────────────────────────────────────────────────────────
function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Strip markdown code fences if the model wrapped the JSON
    const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    try {
      return JSON.parse(jsonMatch[0]) as T;
    } catch {
      return null;
    }
  }
}

function createPrompt(body: ItineraryRequest) {
  const details = [
    `Destination: ${body.destination}`,
    `Duration: ${body.duration} day${body.duration === 1 ? "" : "s"}`,
    `Group size: ${body.group_size ?? "2"}`,
    `Budget: ${body.budget ? `₹${body.budget.toLocaleString()}` : "Not specified"}`,
    `Accommodation: ${body.accommodation_type ?? "Flexible"}`,
    `Transport: ${body.transportation_type ?? "Flexible"}`,
    `Start date: ${body.start_date ?? "TBD"}`,
    `End date: ${body.end_date ?? "TBD"}`,
    `Predicted Persona: ${body.persona ?? "None"}`,
  ];

  if (body.persona_title) {
    details.push(`Persona title: ${body.persona_title}`);
  }
  if (body.persona_description) {
    details.push(`Persona description: ${body.persona_description}`);
  }
  if (body.recommended_destinations) {
    details.push(`Recommended destinations: ${body.recommended_destinations}`);
  }
  if (body.cost_summary) {
    details.push(`Cost prediction summary: ${body.cost_summary}`);
  }
  if (body.budget_advice) {
    details.push(`Budget optimization notes: ${body.budget_advice}`);
  }

  const existing = body.existing_itinerary
    ? `Existing itinerary JSON:
${JSON.stringify(body.existing_itinerary, null, 2)}`
    : "No existing itinerary.";

  const followupInstruction = body.followup
    ? `\n\nFollow-up instruction: ${body.followup}\nWhen a follow-up request is present, update only the affected day(s) and keep the rest of the itinerary unchanged.`
    : "";

  return `You are a smart travel planner that writes high-energy, practical, and itinerary-ready day-by-day plans for groups.

${details.join("\n")}

${existing}

Task:
- Generate a full ${body.duration}-day itinerary for the traveler.
- For each day, include: a short title, summary, 3-4 top attractions, restaurant recommendations, a road-trip or route suggestion, weather-aware advice, and a small packing checklist.
- Keep the response grounded in the persona, budget notes, and recommended destinations.
- If any day is a travel/arrival/departure day, call that out clearly.

Output requirements:
Return ONLY valid JSON (no markdown, no prose outside the JSON) matching this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "title": "...",
      "summary": "...",
      "attractions": ["..."],
      "restaurants": ["..."],
      "route_suggestion": "...",
      "weather_note": "...",
      "packing": ["..."],
      "notes": "..."
    }
  ],
  "cost_summary": "...",
  "budget_advice": "...",
  "partial_update": ${body.followup ? "true" : "false"}
}
${followupInstruction}

If this is a follow-up update, return only the updated days. Do NOT return prose — only the JSON object above.`;
}

function buildMockItinerary(body: ItineraryRequest): ItineraryResponse {
  const days: ItineraryDay[] = Array.from({ length: Math.max(1, Math.min(9, Math.floor(body.duration))) }, (_, index) => {
    const dayNumber = index + 1;
    const coreTitle = dayNumber === 1 ? "Arrival & Easy Orientation" : dayNumber === body.duration ? "Final Relaxed Departure" : `Explore Day ${dayNumber}`;
    return {
      day: dayNumber,
      title: coreTitle,
      summary: `A smooth, colourful day in ${body.destination} shaped for ${body.persona ?? "a thoughtful traveller"}.`,
      attractions: [
        `${body.destination} Landmark ${dayNumber}`,
        `Local cultural market ${dayNumber}`,
        `Scenic viewpoint ${dayNumber}`,
      ],
      restaurants: [
        `Popular café for breakfast`,
        `Local lunch spot with regional flavours`,
        `Relaxed dinner restaurant with good reviews`,
      ],
      route_suggestion: `Start near the main hub, then move to a nearby attraction cluster and finish at a comfortable evening spot. Keep drives under 40 minutes to stay relaxed.`,
      weather_note: `Check the forecast before leaving; pack a light rain jacket if there's any chance of showers.`,
      packing: [
        "Comfortable walking shoes",
        "Light layers for changing temperatures",
        "Sun protection and reusable water bottle",
      ],
      notes: `If you have a flexible budget, swap one restaurant for a higher-end local specialty dinner.`,
    };
  });

  return {
    itinerary: days,
    cost_summary: body.cost_summary ?? `Estimated budget is ${body.budget ? `₹${body.budget.toLocaleString()}` : "flexible"}.`,
    budget_advice:
      body.budget_advice ?? "Keep lunch casual, choose local transportation, and book one scenic dinner to stretch your budget well.",
    partial_update: Boolean(body.followup),
    generated_by: "mock" as const,
  };
}

// ── Error classifiers ─────────────────────────────────────────────────────────
function isRateLimitError(message: string): boolean {
  return /rate.?limit|quota|429|too many requests/i.test(message);
}

// ── Gemini REST call (Gemini Developer API — key-based auth) ─────────────────
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not set");

  // Correct endpoint: generativelanguage.googleapis.com, auth via ?key= query param
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.72,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned empty content");
  return text;
}

// ── Groq OpenAI-compatible call ───────────────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_KEY) throw new Error("GROQ_API_KEY not set");

  // Correct endpoint: api.groq.com (not groq.io), OpenAI chat completions format
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a travel planning assistant. Always respond with valid JSON only — no markdown, no prose outside the JSON object.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.72,
      top_p: 0.9,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq ${response.status}: ${errText}`);
  }

  const data = await response.json();
  // OpenAI-compatible response shape: choices[0].message.content
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Groq returned empty content");
  return text;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body: ItineraryRequest = await req.json();
  const prompt = createPrompt(body);

  // Fast path: no API keys configured at all
  if (!GEMINI_KEY && !GROQ_KEY) {
    console.warn("[itinerary] No API keys configured — using mock fallback");
    return NextResponse.json(buildMockItinerary(body));
  }

  let output: string | null = null;
  let generatedBy: "gemini" | "groq" | "mock" = "mock";
  let geminiError: string | null = null;
  let groqError: string | null = null;

  // ── Step 1: Try Gemini ────────────────────────────────────────────────────
  if (GEMINI_KEY) {
    try {
      console.log(`[itinerary] Trying Gemini (${GEMINI_MODEL})…`);
      output = await callGemini(prompt);
      generatedBy = "gemini";
      console.log("[itinerary] ✅ Gemini succeeded");
    } catch (err) {
      geminiError = err instanceof Error ? err.message : String(err);
      if (isRateLimitError(geminiError)) {
        console.warn(`[itinerary] ⚠️  Gemini rate-limited — falling back to Groq. Error: ${geminiError}`);
      } else {
        console.warn(`[itinerary] ⚠️  Gemini failed — falling back to Groq. Error: ${geminiError}`);
      }
    }
  }

  // ── Step 2: Fallback to Groq if Gemini failed or was skipped ─────────────
  if (!output && GROQ_KEY) {
    try {
      console.log(`[itinerary] Trying Groq (${GROQ_MODEL})…`);
      output = await callGroq(prompt);
      generatedBy = "groq";
      console.log("[itinerary] ✅ Groq succeeded");
    } catch (err) {
      groqError = err instanceof Error ? err.message : String(err);
      console.error(`[itinerary] ❌ Groq also failed. Error: ${groqError}`);
    }
  }

  // ── Step 3: Both failed — use mock ────────────────────────────────────────
  if (!output) {
    console.error(
      "[itinerary] ❌ Both Gemini and Groq failed — using mock fallback.",
      { geminiError, groqError }
    );
    return NextResponse.json({
      ...buildMockItinerary(body),
      _fallback_reason: `Gemini: ${geminiError ?? "not configured"} | Groq: ${groqError ?? "not configured"}`,
    });
  }

  // ── Parse the LLM output ──────────────────────────────────────────────────
  const parsed = safeParseJson<ItineraryResponse>(output);
  if (!parsed || !Array.isArray(parsed.itinerary)) {
    console.error(
      `[itinerary] ❌ ${generatedBy} returned unparseable JSON — using mock fallback.\nRaw output (first 500 chars):\n${output.slice(0, 500)}`
    );
    return NextResponse.json(buildMockItinerary(body));
  }

  console.log(`[itinerary] 🎉 Itinerary generated by: ${generatedBy} | Days: ${parsed.itinerary.length}`);
  return NextResponse.json({ ...parsed, generated_by: generatedBy });
}
