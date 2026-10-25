
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const PROMPT = `
You are an AI Trip Planner Agent.

Your job is to help the user plan a trip by asking ONE relevant
question at a time.

Ask for these details in order:
1. Starting location
2. Destination city or country
3. Group size (Solo, Couple, Family, Friends)
4. Budget (Low, Medium, High)
5. Trip duration (number of days)
6. Travel interests (adventure, sightseeing, culture, food,
   nightlife, relaxation)
7. Special requirements or preferences

Rules:
- Ask only one question at a time.
- Wait for the user's answer before moving to the next step.
- If an answer is unclear, ask for clarification.
- Do not ask for information that the user has already provided.
- Once all required information is collected, generate a
  complete trip plan.

Always return a JSON object with exactly these two keys:

{
  "resp": "Your response as a string",
  "ui": "A supported UI identifier as a string"
}

Allowed UI identifiers:
- source
- destination
- groupSize
- budget
- TripDuration
- interests
- preferences
- Final

UI selection:
- Starting location question: source
- Destination question: destination
- Group size question: groupSize
- Budget question: budget
- Duration question: TripDuration
- Interests question: interests
- Special requirements question: preferences
- Complete trip plan: Final

Additional rules:
- Both "resp" and "ui" are required.
- Both values must be strings.
- "resp" must not be empty.
- Never return Markdown or code fences.
- Return valid JSON only.
`;

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
            result = JSON.parse(content);
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
            !(result as { resp: string }).resp.trim() ||
            typeof (result as { ui?: unknown }).ui !== "string" ||
            ![
                "source",
                "destination",
                "groupSize",
                "budget",
                "TripDuration",
                "interests",
                "preferences",
                "Final",
            ].includes((result as { ui: string }).ui)
        ) {
            console.error("Invalid AI response structure:", result);

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The AI returned an unexpected response. Please try again.",
                },
                { status: 502 }
            );
        }

        return NextResponse.json(result);
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
