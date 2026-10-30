
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**.

 Only ask questions about the following details in order, and wait for the user’s answer before asking the next: 

1. Starting location (source) 
2. Destination city or country 
3. Group size (Solo, Couple, Family, Friends) 
4. Budget (Low, Medium, High) 
5. Trip duration (number of days) 
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation) 
7. Special requirements or preferences (if any)
Do not ask multiple questions at once, and never ask irrelevant questions.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.
Always maintain a conversational, interactive style while asking questions.
Along wth response also send which ui component to display for generative UI for example 'budget/groupSize/tripDuration/final) , where Final means AI generating complete final outpur
Once all required information is collected, generate and return a **strict JSON response only** (no explanations or extra text) with following JSON schema:
{
resp:'Text Resp',
ui:'budget/groupSize/tripDuration/final)'
}
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
