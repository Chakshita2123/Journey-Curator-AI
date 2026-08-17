import { NextRequest, NextResponse } from "next/server";
import type { ItineraryRequest, ItineraryResponse, ItineraryDay } from "@/types/api";

// ── Environment config ────────────────────────────────────────────────────────
const GEMINI_KEY  = process.env.GEMINI_API_KEY;
// gemini-3.6-flash — current production standard (Aug 2026), great for structured JSON output
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

const GROQ_KEY   = process.env.GROQ_API_KEY;
// llama-3.3-70b-versatile — currently active on Groq (Aug 2026)
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

// ── JSON helpers ──────────────────────────────────────────────────────────────
function cleanJsonString(str: string): string {
  return str
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/,\s*([}\]])/g, "$1") // fix trailing commas before } or ]
    .trim();
}

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const cleaned = cleanJsonString(text);
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) return null;
      try {
        const cleanedMatch = jsonMatch[0].replace(/,\s*([}\]])/g, "$1");
        return JSON.parse(cleanedMatch) as T;
      } catch {
        return null;
      }
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
  ];

  if (body.cost_summary) {
    details.push(`Cost prediction summary: ${body.cost_summary}`);
  }
  if (body.budget_advice) {
    details.push(`Budget optimization notes: ${body.budget_advice}`);
  }

  const existing = body.existing_itinerary
    ? `Existing itinerary JSON:\n${JSON.stringify(body.existing_itinerary, null, 2)}`
    : "No existing itinerary.";

  const followupInstruction = body.followup
    ? `\n\nFollow-up instruction: ${body.followup}\nWhen a follow-up request is present, update only the affected day(s) and keep the rest of the itinerary unchanged.`
    : "";

  return `You are an expert travel planner writing high-energy, realistic, and detailed day-by-day itineraries for travel in ${body.destination}.

TRIP SPECIFICATIONS:
${details.join("\n")}

${existing}

REQUIREMENTS:
1. Generate a complete ${body.duration}-day itinerary for ${body.destination}.
2. CRITICAL: Use REAL, FAMOUS, and SPECIFIC places, temples, monuments, restaurants, markets, and street food spots in ${body.destination}. Do NOT use generic place names like "Landmark 1" or "Local Market".
3. HIDDEN GEM REQUIREMENT: For EVERY single day, include 1 "hidden_gem" field featuring a lesser-known, offbeat, or serene local spot/experience that standard tourists often miss!
4. For each day, include:
   - "title": Short engaging day title
   - "summary": 2-3 sentence overview of the day
   - "attractions": List of 2-3 real, famous mainstream attractions/places in ${body.destination}
   - "hidden_gem": 1 specific lesser-known offbeat attraction or quiet local spot in ${body.destination}
   - "restaurants": List of 2 real, famous local eateries/restaurants/cafes in ${body.destination}
   - "route_suggestion": Practical travel route & transit tips
   - "weather_note": Useful seasonal/weather advice
   - "packing": List of 3 essential items for that day's activities
   - "notes": Extra insider tip or money-saving advice

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "title": "...",
      "summary": "...",
      "attractions": ["Famous Spot 1", "Famous Spot 2"],
      "hidden_gem": "Quiet Offbeat Temple / Secret Viewpoint",
      "restaurants": ["Real Restaurant 1", "Real Restaurant 2"],
      "route_suggestion": "...",
      "weather_note": "...",
      "packing": ["..."],
      "notes": "..."
    }
  ],
  "cost_summary": "Estimated total trip cost summary",
  "budget_advice": "Practical budget saving tip",
  "partial_update": ${body.followup ? "true" : "false"}
}
${followupInstruction}

Do NOT output markdown commentary or text outside the JSON object.`;
}

// Destination attraction knowledge base for fallback
const DESTINATION_KNOWLEDGE: Record<string, { attractions: string[]; hidden_gems: string[]; restaurants: string[]; routes: string[] }> = {
  vrindavan: {
    attractions: ["Banke Bihari Temple", "Prem Mandir", "ISKCON Vrindavan", "Radha Raman Temple", "Seva Kunj", "Kaliya Ghat"],
    hidden_gems: ["Nidhivan Sacred Grove at quiet dusk", "Gopeshwar Mahadev Temple ancient courtyard", "Kesi Ghat evening lamp lighting", "Madan Mohan Temple hilltop view"],
    restaurants: ["Govinda's Restaurant", "MVT Restaurant", "Brijwasi Mithai Wala", "Amrit Bhogan"],
    routes: ["Start early morning at Banke Bihari, walk through ancient alleyways to Radha Raman, afternoon rest, evening Prem Mandir light show."],
  },
  jaipur: {
    attractions: ["Hawa Mahal", "Amber Fort", "City Palace", "Jantar Mantar", "Nahargarh Fort", "Jal Mahal"],
    hidden_gems: ["Panna Meena ka Kund stepwell", "Galtaji Monkey Temple in narrow gorge", "Sisodia Rani Garden quiet pavilions", "Anokhi Museum of Hand Printing"],
    restaurants: ["Laxmi Mishthan Bhandar (LMB)", "Chokhi Dhani", "Tapri Central", "Rawat Mishthan Bhandar"],
    routes: ["Old City pink bazaar walk → Hawa Mahal → City Palace → Evening sunset view from Nahargarh Fort."],
  },
  agra: {
    attractions: ["Taj Mahal", "Agra Fort", "Mehtab Bagh", "Tomb of Itimad-ud-Daulah (Baby Taj)", "Fatehpur Sikri"],
    hidden_gems: ["Secret rooftop view of Taj Mahal from Taj Ganj cafe", "Akbar's Tomb at Sikandra serene gardens", "Kachhpura village heritage walk"],
    restaurants: ["Pinch of Spice", "Dasaprakash", "Shankara Vegis Restaurant", "Sadar Bazaar Petha stalls"],
    routes: ["Sunrise at Taj Mahal → Breakfast → Agra Fort tour → Sunset view of Taj Mahal from Mehtab Bagh across Yamuna."],
  },
  delhi: {
    attractions: ["India Gate", "Red Fort", "Qutub Minar", "Humayun's Tomb", "Lotus Temple", "Chandni Chowk"],
    hidden_gems: ["Agrasen ki Baoli hidden stepwell", "Sunder Nursery Mughal gardens", "Mehrauli Archaeological Park ruins", "Hazrat Nizamuddin Dargah qawwali night"],
    restaurants: ["Karim's Chandni Chowk", "Bukhara", "Saravana Bhavan Janpath", "Paranthe Wali Gali"],
    routes: ["Heritage walk in Old Delhi → Metro to Central Delhi for India Gate & Lodhi Garden → Evening at Hauz Khas Village."],
  },
  mumbai: {
    attractions: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Juhu Beach", "Siddhivinayak Temple", "Colaba Causeway"],
    restaurants: ["Britannia & Co.", "Bademiya", "Café Mondegar", "Leopold Café"],
    hidden_gems: ["Banganga Tank peaceful ancient precinct in Malabar Hill", "Bandra Latin Quarter street art walk", "Khotachiwadi heritage village enclave"],
    routes: ["Ferry to Elephanta Caves → Afternoon Colaba shopping → Sunset stroll along Marine Drive Queen's Necklace."],
  },
  goa: {
    attractions: ["Calangute Beach", "Fort Aguada", "Basilica of Bom Jesus", "Baga Beach", "Dudhsagar Falls", "Anjuna Flea Market"],
    hidden_gems: ["Butterfly Beach secluded cove", "Divar Island quiet ferry ride & rice paddies", "Chorla Ghats misty jungle trail", "Cabo de Rama Fort cliff view"],
    restaurants: ["Fisherman's Wharf", "Thalassa", "Britto's Baga", "Gunpowder Assagao"],
    routes: ["Morning water sports at Baga → Heritage walk in Fontainhas → Sunset cocktails & seafood at Anjuna."],
  },
  varanasi: {
    attractions: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath", "Assi Ghat", "Manikarnika Ghat", "Ramnagar Fort"],
    hidden_gems: ["Lolark Kund ancient sun stepwell", "Scindia Ghat leaning temple view", "Kedar Ghat colorful steps", "Monkey Temple at sunrise"],
    restaurants: ["Kashi Chat Bhandar", "Blue Lassi Shop", "Pizzeria Vaatika Cafe Assi"],
    routes: ["Subah-e-Banaras sunrise boat ride at Assi Ghat → Temple visits → Evening Ganga Aarti at Dashashwamedh Ghat."],
  },
  kerala: {
    attractions: ["Alleppey Houseboat Backwaters", "Munnar Tea Gardens", "Fort Kochi", "Mattancherry Palace", "Varkala Cliff Beach"],
    hidden_gems: ["Munroe Island narrow canoe channels", "Marari quiet fishing village beach", "Kolukkumalai world's highest organic tea estate"],
    restaurants: ["Kashi Art Café Fort Kochi", "Oceanos Seafood", "Rapsy Restaurant Munnar"],
    routes: ["Morning Shikara boat cruise → Spice plantation visit → Evening Kathakali performance."],
  },
  manali: {
    attractions: ["Hadimba Temple", "Solang Valley", "Rohtang Pass", "Old Manali", "Jogini Waterfalls", "Vashisht Hot Springs"],
    hidden_gems: ["Sethan Village igloo & quiet snow valley", "Naggar Castle serene heritage art gallery", "Jana Waterfall local Himachali food hut"],
    restaurants: ["Café 1947", "Johnson's Café", "The Lazy Dog", "Dylan's Toasted Roast Café"],
    routes: ["Morning walk in Old Manali pine forest → Hadimba Temple → Afternoon trek to Jogini Falls → Evening hot springs."],
  },
};

function buildMockItinerary(body: ItineraryRequest): ItineraryResponse {
  const destLower = body.destination.toLowerCase();
  const matchedKey = Object.keys(DESTINATION_KNOWLEDGE).find((k) => destLower.includes(k));
  const destData = matchedKey ? DESTINATION_KNOWLEDGE[matchedKey] : null;

  const days: ItineraryDay[] = Array.from({ length: Math.max(1, Math.min(9, Math.floor(body.duration))) }, (_, index) => {
    const dayNumber = index + 1;
    const coreTitle = dayNumber === 1
      ? `Arrival & ${destData ? destData.attractions[0] : body.destination} Exploration`
      : dayNumber === body.duration
      ? "Final Souvenir Shopping & Departure"
      : `Highlights & Culture — Day ${dayNumber}`;

    const defaultAttractions = destData
      ? [
          destData.attractions[(index * 2) % destData.attractions.length],
          destData.attractions[(index * 2 + 1) % destData.attractions.length],
        ]
      : [
          `Famous Heritage Spot in ${body.destination}`,
          `Central Cultural Market`,
        ];

    const defaultHiddenGem = destData
      ? destData.hidden_gems[index % destData.hidden_gems.length]
      : `Peaceful offbeat viewpoint in ${body.destination}`;

    const defaultRestaurants = destData
      ? [
          destData.restaurants[index % destData.restaurants.length],
          destData.restaurants[(index + 1) % destData.restaurants.length],
        ]
      : [`Renowned local eatery in ${body.destination}`, `Popular regional restaurant`];

    const routeMsg = destData?.routes[index % destData.routes.length] ??
      `Start at the main city center, explore nearby attractions on foot, and head to a scenic spot for evening dinner.`;

    return {
      day: dayNumber,
      title: coreTitle,
      summary: `A vibrant day exploring the best heritage, cuisine, and sights of ${body.destination}.`,
      attractions: defaultAttractions,
      hidden_gem: defaultHiddenGem,
      restaurants: defaultRestaurants,
      route_suggestion: routeMsg,
      weather_note: `Check morning weather; carry a water bottle and comfortable walking footwear.`,
      packing: [
        "Comfortable walking shoes",
        "Sun protection & sunglasses",
        "Camera & portable power bank",
      ],
      notes: `Book entry tickets early online to avoid waiting in long morning queues.`,
    };
  });

  return {
    itinerary: days,
    cost_summary: body.cost_summary ?? `Estimated total budget: ${body.budget ? `₹${body.budget.toLocaleString()}` : "₹12,000–₹25,000"}.`,
    budget_advice: body.budget_advice ?? "Use local autorickshaws/public transit for short distances and eat at busy local eateries to stay well within budget.",
    partial_update: Boolean(body.followup),
    generated_by: "mock" as const,
  };
}

// ── Error classifiers ─────────────────────────────────────────────────────────
function isRateLimitError(message: string): boolean {
  return /rate.?limit|quota|429|too many requests/i.test(message);
}

// ── Gemini REST call (Gemini Developer API — key-based auth) ─────────────────
async function callGemini(apiKey: string, modelName: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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
    console.error(`[itinerary] ❌ Gemini Error (${modelName}) Status ${response.status}: ${errText}`);
    throw new Error(`Gemini ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned empty content");
  return text;
}

// ── Dynamically resolve best available Groq models ────────────────────────────
// Calls Groq's /models endpoint to get live model list, then returns IDs in
// priority order (prefer large versatile models, avoid embedding/deprecated ones).
async function resolveGroqModels(apiKey: string, envDefault: string): Promise<string[]> {
  // Static priority fallback (used if live-fetch fails or as ordering reference)
  const STATIC_FALLBACK = [
    envDefault,
    "llama-3.3-70b-versatile",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "compound-beta",
    "compound-beta-mini",
  ];

  // Deduplicate preserving order
  const dedup = (arr: string[]) => [...new Set(arr)];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Groq models list returned ${res.status}`);
    const data = await res.json();
    // Filter to text-generation capable models only (exclude embedding, whisper, tts, vision-only)
    const liveIds: string[] = (data?.data ?? [])
      .map((m: { id: string }) => m.id)
      .filter((id: string) =>
        !/(embed|whisper|tts|vision-only|guard)/i.test(id)
      );

    if (liveIds.length === 0) throw new Error("No usable models found in Groq list");

    // Put static priority models first if they appear in live list
    const prioritized = STATIC_FALLBACK.filter((m) => liveIds.includes(m));
    const rest = liveIds.filter((m) => !STATIC_FALLBACK.includes(m));
    const resolved = dedup([...prioritized, ...rest]);
    console.log(`[itinerary] 📋 Groq live models resolved (${resolved.length}): ${resolved.slice(0, 5).join(", ")}${resolved.length > 5 ? " …" : ""}`);
    return resolved;
  } catch (err) {
    console.warn(`[itinerary] ⚠️  Could not fetch Groq live model list (${err instanceof Error ? err.message : err}) — using static fallback chain`);
    return dedup(STATIC_FALLBACK);
  }
}

// ── Groq OpenAI-compatible call ───────────────────────────────────────────────
async function callGroq(apiKey: string, modelName: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
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
    console.error(`[itinerary] ❌ Groq Error (${modelName}) Status ${response.status}: ${errText}`);
    throw new Error(`Groq ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Groq returned empty content");
  return text;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body: ItineraryRequest = await req.json();
  const prompt = createPrompt(body);

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  console.log(`[itinerary] Request for destination: "${body.destination}", duration: ${body.duration} days`);
  console.log(`[itinerary] Key status — Gemini: ${geminiKey ? `set (len ${geminiKey.length}, prefix ${geminiKey.slice(0, 6)}...)` : 'missing'} | Groq: ${groqKey ? `set (len ${groqKey.length}, prefix ${groqKey.slice(0, 6)}...)` : 'missing'}`);

  if (!geminiKey && !groqKey) {
    console.warn("[itinerary] No API keys configured — using mock fallback");
    return NextResponse.json(buildMockItinerary(body));
  }

  let output: string | null = null;
  let generatedBy: "gemini" | "groq" | "mock" = "mock";
  let geminiError: string | null = null;
  let groqError: string | null = null;

  // ── Step 1: Try Gemini ────────────────────────────────────────────────────
  // Fallback chain: gemini-3.6-flash (current production, Aug 2026)
  //                 → gemini-3.5-flash → gemini-2.5-flash → gemini-2.5-flash-lite
  if (geminiKey) {
    const geminiModels = [
      process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
    ];
    // Deduplicate in case GEMINI_MODEL env matches one of the static fallbacks
    const uniqueGeminiModels = [...new Set(geminiModels)];
    for (const gModel of uniqueGeminiModels) {
      try {
        console.log(`[itinerary] Trying Gemini (${gModel})…`);
        output = await callGemini(geminiKey, gModel, prompt);
        generatedBy = "gemini";
        console.log(`[itinerary] ✅ Gemini (${gModel}) succeeded`);
        break;
      } catch (err) {
        geminiError = err instanceof Error ? err.message : String(err);
        console.warn(`[itinerary] ⚠️  Gemini (${gModel}) failed: ${geminiError}`);
      }
    }
  }

  // ── Step 2: Fallback to Groq if Gemini failed or was skipped ─────────────
  // Dynamically fetches available Groq models so this stays current even after
  // future deprecations without needing a code change.
  if (!output && groqKey) {
    const groqModels = await resolveGroqModels(groqKey, process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile");
    for (const qModel of groqModels) {
      try {
        console.log(`[itinerary] Trying Groq (${qModel})…`);
        output = await callGroq(groqKey, qModel, prompt);
        generatedBy = "groq";
        console.log(`[itinerary] ✅ Groq (${qModel}) succeeded`);
        break;
      } catch (err) {
        groqError = err instanceof Error ? err.message : String(err);
        console.warn(`[itinerary] ⚠️  Groq (${qModel}) failed: ${groqError}`);
      }
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
  const parsed = safeParseJson<any>(output);
  let itineraryDays: ItineraryDay[] | null = null;

  if (parsed) {
    if (Array.isArray(parsed.itinerary)) {
      itineraryDays = parsed.itinerary;
    } else if (Array.isArray(parsed.days)) {
      itineraryDays = parsed.days;
    } else if (Array.isArray(parsed.daily_itinerary)) {
      itineraryDays = parsed.daily_itinerary;
    } else if (Array.isArray(parsed.plan)) {
      itineraryDays = parsed.plan;
    } else if (Array.isArray(parsed)) {
      itineraryDays = parsed;
    }
  }

  if (!itineraryDays || itineraryDays.length === 0) {
    console.error(
      `[itinerary] ❌ ${generatedBy} returned unparseable JSON structure — using mock fallback.\nRaw output (first 500 chars):\n${output.slice(0, 500)}`
    );
    return NextResponse.json(buildMockItinerary(body));
  }

  // Normalize days items to ensure standard shape
  const normalizedDays: ItineraryDay[] = itineraryDays.map((item: any, idx: number) => ({
    day: Number(item.day ?? item.day_number ?? idx + 1),
    title: String(item.title ?? item.day_title ?? `Day ${idx + 1}`),
    summary: String(item.summary ?? item.description ?? `Day ${idx + 1} highlights in ${body.destination}.`),
    attractions: Array.isArray(item.attractions)
      ? item.attractions.map(String)
      : Array.isArray(item.places)
      ? item.places.map(String)
      : [String(item.attractions ?? `${body.destination} attraction ${idx + 1}`)],
    hidden_gem: item.hidden_gem ? String(item.hidden_gem) : item.secret_spot ? String(item.secret_spot) : undefined,
    restaurants: Array.isArray(item.restaurants)
      ? item.restaurants.map(String)
      : Array.isArray(item.food_spots)
      ? item.food_spots.map(String)
      : [String(item.restaurants ?? `Local eatery`)],
    route_suggestion: String(item.route_suggestion ?? item.route ?? item.transit ?? "Explore central area on foot or by local auto."),
    weather_note: String(item.weather_note ?? item.weather ?? "Check daily weather forecast."),
    packing: Array.isArray(item.packing) ? item.packing.map(String) : ["Water bottle", "Walking shoes"],
    notes: item.notes ? String(item.notes) : undefined,
  }));

  const finalResponse: ItineraryResponse = {
    itinerary: normalizedDays,
    cost_summary: String(parsed.cost_summary ?? `Estimated total trip cost summary for ${body.destination}.`),
    budget_advice: String(parsed.budget_advice ?? "Eat at authentic local spots and use public transport for maximum savings."),
    partial_update: Boolean(parsed.partial_update ?? body.followup),
    generated_by: generatedBy,
  };

  console.log(`[itinerary] 🎉 Itinerary generated by: ${generatedBy} | Days: ${normalizedDays.length}`);
  return NextResponse.json(finalResponse);
}
