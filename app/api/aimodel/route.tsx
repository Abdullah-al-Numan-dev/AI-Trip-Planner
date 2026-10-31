import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**.

Only ask questions about the following details in order, and wait for the user's answer before asking the next: 

1. Starting location (source) 
2. Destination city or country 
3. Group size (Solo, Couple, Family, Friends) 
4. Budget (Cheap, Moderate, Luxury) 
5. Trip duration (number of days) 
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation) 
7. Special requirements or preferences (if any)

Rules:
- Ask only one question at a time.
- Do not ask multiple questions at once, and never ask irrelevant questions.
- If any answer is missing or unclear, politely ask the user to clarify before proceeding.
- Always maintain a conversational, interactive style while asking questions.
- When all required information has been collected, generate a complete, inspiring trip itinerary.

JSON Response Format:
On EVERY response, you MUST return a strict JSON object only (no Markdown fences, no explanations outside the JSON) matching this exact schema:
{
  "resp": "Your conversational response and the single question you are asking, or the final trip plan",
  "ui": "ONE_ALLOWED_UI_NAME"
}

Allowed values for "ui" (choose EXACTLY ONE string that corresponds to what you are currently asking for):
- "source": when asking for the starting location
- "destination": when asking for the destination city or country
- "groupSize": when asking for group size
- "budget": when asking for budget
- "TripDuration": when asking for trip duration / number of days
- "interests": when asking for travel interests
- "preferences": when asking for special requirements or preferences
- "Final": when all information is collected and you are presenting the final complete trip plan

IMPORTANT:
- The "ui" field must contain ONLY ONE string from the allowed list above (e.g. "TripDuration").
- NEVER combine multiple values with slashes (do NOT output "budget/groupSize/tripDuration").
`;

const VALID_UI_OPTIONS = [
    "source",
    "destination",
    "groupSize",
    "budget",
    "TripDuration",
    "interests",
    "preferences",
    "Final",
] as const;

type ValidUi = (typeof VALID_UI_OPTIONS)[number];

function normalizeUi(rawUi: unknown, respText: string): ValidUi | null {
    if (typeof rawUi === "string") {
        const trimmed = rawUi.trim();

        // 1. Exact match
        if (VALID_UI_OPTIONS.includes(trimmed as ValidUi)) {
            return trimmed as ValidUi;
        }

        // 2. Case-insensitive exact match
        const lower = trimmed.toLowerCase();
        for (const valid of VALID_UI_OPTIONS) {
            if (valid.toLowerCase() === lower) {
                return valid;
            }
        }

        // 3. Handle slashed/chained strings like "budget/groupSize/tripDuration"
        const segments = trimmed
            .split(/[/|,]/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        for (const segment of [...segments].reverse()) {
            for (const valid of VALID_UI_OPTIONS) {
                if (valid.toLowerCase() === segment) {
                    return valid;
                }
            }
        }
    }

    // 4. Fallback inference based on question text in resp
    const lowerResp = respText.toLowerCase();
    if (
        lowerResp.includes("how many days") ||
        lowerResp.includes("trip duration") ||
        lowerResp.includes("number of days") ||
        lowerResp.includes("duration")
    ) {
        return "TripDuration";
    }
    if (
        lowerResp.includes("budget") ||
        lowerResp.includes("cost") ||
        lowerResp.includes("cheap") ||
        lowerResp.includes("moderate") ||
        lowerResp.includes("luxury")
    ) {
        return "budget";
    }
    if (
        lowerResp.includes("group size") ||
        lowerResp.includes("who is traveling") ||
        lowerResp.includes("who are you traveling with") ||
        lowerResp.includes("how many people") ||
        lowerResp.includes("travel companions") ||
        lowerResp.includes("solo") ||
        lowerResp.includes("couple") ||
        lowerResp.includes("family") ||
        lowerResp.includes("friends")
    ) {
        return "groupSize";
    }
    if (
        lowerResp.includes("starting location") ||
        lowerResp.includes("departure") ||
        lowerResp.includes("where are you starting") ||
        lowerResp.includes("traveling from")
    ) {
        return "source";
    }
    if (
        lowerResp.includes("destination") ||
        lowerResp.includes("where do you want to go") ||
        lowerResp.includes("where would you like to travel") ||
        lowerResp.includes("which city") ||
        lowerResp.includes("which country")
    ) {
        return "destination";
    }
    if (
        lowerResp.includes("interest") ||
        lowerResp.includes("activities") ||
        lowerResp.includes("sightseeing") ||
        lowerResp.includes("nightlife")
    ) {
        return "interests";
    }
    if (
        lowerResp.includes("requirement") ||
        lowerResp.includes("preference") ||
        lowerResp.includes("dietary") ||
        lowerResp.includes("special request")
    ) {
        return "preferences";
    }
    if (
        lowerResp.includes("itinerary") ||
        lowerResp.includes("here is your trip plan") ||
        lowerResp.includes("final trip") ||
        lowerResp.includes("day 1")
    ) {
        return "Final";
    }

    return null;
}

export async function POST(req: NextRequest) {
    try {
        // Check API key
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    message: "OPENROUTER_API_KEY is not configured.",
                },
                { status: 500 }
            );
        }

        // Validate request body
        let body: { messages?: unknown };

        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON request body.",
                },
                { status: 400 }
            );
        }

        const { messages } = body;

        if (
            !Array.isArray(messages) ||
            messages.length === 0 ||
            messages.some(
                (message) =>
                    !message ||
                    typeof message !== "object" ||
                    !["user", "assistant"].includes(
                        (message as { role?: string }).role ?? ""
                    ) ||
                    typeof (message as { content?: unknown }).content !==
                        "string"
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid messages array is required.",
                },
                { status: 400 }
            );
        }

        // Request AI response
        const completion = await openai.chat.completions.create({
            model: "openrouter/free",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: PROMPT,
                },
                ...messages,
            ],
        });

        const content = completion.choices[0]?.message?.content;

        // Log raw response for debugging
        console.log("Raw AI response:", content);

        if (!content) {
            return NextResponse.json(
                {
                    success: false,
                    message: "The AI returned an empty response. Please retry.",
                },
                { status: 502 }
            );
        }

        // Parse AI response
        let result: unknown;

        try {
            let cleanContent = content.trim();
            if (cleanContent.startsWith("```")) {
                cleanContent = cleanContent
                    .replace(/^```(?:json)?\s*/i, "")
                    .replace(/\s*```$/, "")
                    .trim();
            }
            result = JSON.parse(cleanContent);
        } catch {
            console.error("AI returned invalid JSON:", content);

            return NextResponse.json(
                {
                    success: false,
                    message: "The AI returned invalid JSON. Please retry.",
                },
                { status: 502 }
            );
        }

        // Validate response structure
        if (
            !result ||
            typeof result !== "object" ||
            typeof (result as { resp?: unknown }).resp !== "string" ||
            !(result as { resp: string }).resp.trim()
        ) {
            console.error("Invalid AI response structure (missing resp):", result);

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The AI returned an unexpected response. Please try again.",
                },
                { status: 502 }
            );
        }

        const rawUi = (result as { ui?: unknown }).ui;
        const respText = (result as { resp: string }).resp.trim();
        const normalizedUi = normalizeUi(rawUi, respText);

        if (!normalizedUi) {
            console.error("Invalid AI response structure (unrecognized ui):", result);

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The AI returned an unexpected response. Please try again.",
                },
                { status: 502 }
            );
        }

        return NextResponse.json({
            resp: respText,
            ui: normalizedUi,
        });
    } catch (error: unknown) {
        console.error("AI API Error:", error);

        if (error instanceof OpenAI.APIError) {
            if (error.status === 429) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "All available free AI capacity may be busy. Please try again shortly.",
                    },
                    { status: 429 }
                );
            }

            if (error.status === 401 || error.status === 403) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "OpenRouter authentication failed. Check your API key and account access.",
                    },
                    { status: error.status }
                );
            }

            if (error.status === 400) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "The selected AI model rejected the request. Check its supported parameters.",
                    },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Something went wrong with the AI service. Please try again.",
            },
            { status: 502 }
        );
    }
}
