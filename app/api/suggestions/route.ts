import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      age,
      gender,
      height,
      weight,
      fitnessLevel,
      goals,
      conditions,
      preferences,
    } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const prompt = `You are a professional fitness consultant. Based on the following user profile, provide a personalized exercise plan with detailed suggestions.

USER PROFILE:
- Age: ${age || "Not specified"}
- Gender: ${gender || "Not specified"}
- Height: ${height || "Not specified"}
- Weight: ${weight || "Not specified"}
- Current Fitness Level: ${fitnessLevel || "Not specified"}
- Fitness Goals: ${goals || "Not specified"}
- Pre-existing Health Conditions / Injuries: ${conditions || "None mentioned"}
- Exercise Preferences: ${preferences || "No preferences"}

Please respond with a JSON object in this exact format (no markdown, no code blocks, just raw JSON):
{
  "summary": "A brief 2-3 sentence personalized overview of the recommendation approach.",
  "weeklyPlan": [
    {
      "day": "Day 1",
      "focus": "The focus area (e.g., Upper Body Strength)",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": "3",
          "reps": "12",
          "duration": "optional duration like 30 seconds",
          "notes": "Brief form tip or modification for this user"
        }
      ],
      "restPeriod": "60-90 seconds between sets"
    }
  ],
  "tips": ["Array of 4-5 personalized tips based on the user's goals and conditions"],
  "cautions": ["Array of 1-3 things to be careful about based on conditions/fitness level"],
  "availableInApp": ["List of exercises from this plan that are available for real-time tracking in FitVision: Squats, Pushups, Bicep Curls, Shoulder Press, Lunges, Jumping Jacks, Deadlifts — only mention relevant ones"]
}

Provide a 4-5 day weekly plan. Keep exercises practical and suitable for home/gym. Be mindful of any health conditions mentioned. Only recommend from known, standard exercises.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let parsed;
    try {
      // Remove potential markdown code blocks
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return raw text
      return NextResponse.json({ raw: text });
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
