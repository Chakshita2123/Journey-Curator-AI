import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

interface SampleCombo {
  id: string;
  title: string;
  flag: string;
  destination: string;
  duration: number;
  persona: string;
  persona_title: string;
  persona_badge: string;
  group_size: string;
  budget: number;
  accommodation_type: string;
  transportation_type: string;
}

const SAMPLE_REQUESTS: SampleCombo[] = [
  {
    id: "goa-5d-relaxed",
    title: "Goa Beach & Coastal Chill",
    flag: "🌴",
    destination: "Goa",
    duration: 5,
    persona: "Relaxed Vacationer",
    persona_title: "The Coastal Unwinder",
    persona_badge: "Relaxed Vacationer",
    group_size: "2 Travelers",
    budget: 35000,
    accommodation_type: "Beachfront Resort",
    transportation_type: "Flight & Scooter",
  },
  {
    id: "rajasthan-7d-culture",
    title: "Royal Forts & Palaces of Rajasthan",
    flag: "🏰",
    destination: "Rajasthan (Jaipur, Udaipur, Jodhpur)",
    duration: 7,
    persona: "Culture & Food Explorer",
    persona_title: "Heritage & Culinary Explorer",
    persona_badge: "Culture Explorer",
    group_size: "2 Travelers",
    budget: 60000,
    accommodation_type: "Heritage Haveli",
    transportation_type: "Train & Private Car",
  },
  {
    id: "himachal-4d-adventurer",
    title: "Manali Mountain & Thrill Expedition",
    flag: "🏔️",
    destination: "Himachal Pradesh (Manali & Solang Valley)",
    duration: 4,
    persona: "Adventurer",
    persona_title: "Alpine Thrill Seeker",
    persona_badge: "Adventurer",
    group_size: "4 Friends",
    budget: 25000,
    accommodation_type: "Mountain Cabin / Hostel",
    transportation_type: "Overnight Bus & Jeep",
  },
  {
    id: "kerala-6d-wellness",
    title: "Kerala Backwaters & Tea Gardens",
    flag: "🚣",
    destination: "Kerala (Munnar & Alleppey)",
    duration: 6,
    persona: "Luxury Wellness Seeker",
    persona_title: "Serenity & Ayurvedic Escapist",
    persona_badge: "Nature & Wellness",
    group_size: "2 Travelers",
    budget: 50000,
    accommodation_type: "Private Houseboat & Eco Resort",
    transportation_type: "Private Car",
  },
];

function createPrompt(combo: SampleCombo) {
  return `You are a smart travel planner that writes high-energy, practical, and itinerary-ready day-by-day plans.

Destination: ${combo.destination}
Duration: ${combo.duration} days
Group size: ${combo.group_size}
Budget: ₹${combo.budget.toLocaleString()}
Accommodation: ${combo.accommodation_type}
Transport: ${combo.transportation_type}
Predicted Persona: ${combo.persona}
Persona Title: ${combo.persona_title}

Task:
- Generate a full ${combo.duration}-day itinerary for the traveler.
- For each day, include: a short title, summary, 3-4 top attractions, restaurant recommendations, a road-trip or route suggestion, weather-aware advice, and a small packing checklist.
- Keep the response grounded in the persona and destination details.

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
  "budget_advice": "..."
}`;
}

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
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

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not set");
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

async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_KEY) throw new Error("GROQ_API_KEY not set");
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
          content: "You are a travel planning assistant. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.72,
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq ${response.status}: ${errText}`);
  }
  const data = await response.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Groq returned empty content");
  return text;
}

export async function GET() {
  const generatedItineraries = [];

  for (const combo of SAMPLE_REQUESTS) {
    const prompt = createPrompt(combo);
    let output: string | null = null;
    let provider = "mock";

    if (GEMINI_KEY) {
      try {
        console.log(`[sample-gen] Generating ${combo.id} via Gemini...`);
        output = await callGemini(prompt);
        provider = "gemini";
      } catch (e) {
        console.warn(`[sample-gen] Gemini failed for ${combo.id}: ${e}`);
      }
    }

    if (!output && GROQ_KEY) {
      try {
        console.log(`[sample-gen] Generating ${combo.id} via Groq...`);
        output = await callGroq(prompt);
        provider = "groq";
      } catch (e) {
        console.warn(`[sample-gen] Groq failed for ${combo.id}: ${e}`);
      }
    }

    if (output) {
      const parsed = safeParseJson<any>(output);
      if (parsed && Array.isArray(parsed.itinerary)) {
        generatedItineraries.push({
          ...combo,
          itinerary: parsed.itinerary,
          cost_summary: parsed.cost_summary,
          budget_advice: parsed.budget_advice,
          generated_by: provider,
          generated_at: new Date().toISOString(),
        });
        continue;
      }
    }

    console.error(`[sample-gen] Failed to generate for ${combo.id}`);
  }

  // Write to src/data/sampleItineraries.json
  const dataDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, "sampleItineraries.json");
  fs.writeFileSync(filePath, JSON.stringify(generatedItineraries, null, 2), "utf-8");

  return NextResponse.json({
    success: true,
    count: generatedItineraries.length,
    saved_to: filePath,
    sample_itineraries: generatedItineraries,
  });
}
