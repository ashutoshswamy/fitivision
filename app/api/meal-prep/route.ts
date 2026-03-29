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
      activityLevel,
      dietaryGoals,
      dietaryRestrictions,
      allergies,
      cuisinePreferences,
      mealsPerDay,
      budget,
      cookingSkill,
      prepTime,
    } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const prompt = `You are a professional nutritionist and meal prep coach. Based on the following user profile, provide a personalized weekly meal preparation plan with detailed recipes and nutritional information.

USER PROFILE:
- Age: ${age || "Not specified"}
- Gender: ${gender || "Not specified"}
- Height: ${height || "Not specified"}
- Weight: ${weight || "Not specified"}
- Activity Level: ${activityLevel || "Not specified"}
- Dietary Goals: ${dietaryGoals || "Not specified"}
- Dietary Restrictions: ${dietaryRestrictions || "None"}
- Food Allergies: ${allergies || "None"}
- Cuisine Preferences: ${cuisinePreferences || "No preferences"}
- Meals Per Day: ${mealsPerDay || "3"}
- Budget: ${budget || "Not specified"}
- Cooking Skill Level: ${cookingSkill || "Not specified"}
- Max Prep Time Per Meal: ${prepTime || "Not specified"}

Please respond with a JSON object in this exact format (no markdown, no code blocks, just raw JSON):
{
  "summary": "A brief 2-3 sentence personalized overview of the meal plan approach, including estimated daily calories and macros.",
  "dailyTargets": {
    "calories": "estimated daily calorie target",
    "protein": "protein in grams",
    "carbs": "carbs in grams",
    "fats": "fats in grams"
  },
  "weeklyPlan": [
    {
      "day": "Day 1",
      "theme": "The theme for the day (e.g., Mediterranean Monday)",
      "meals": [
        {
          "type": "Breakfast/Lunch/Dinner/Snack",
          "name": "Meal name",
          "prepTime": "e.g., 15 min",
          "calories": "estimated calories",
          "protein": "protein in grams",
          "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
          "instructions": "Brief step-by-step cooking instructions (2-4 sentences)",
          "mealPrepTip": "Optional tip for prepping ahead"
        }
      ],
      "dailyTotal": {
        "calories": "total daily calories",
        "protein": "total protein"
      }
    }
  ],
  "groceryList": [
    {
      "category": "Proteins/Vegetables/Grains/Dairy/Pantry/Fruits",
      "items": ["item 1 with quantity for the week", "item 2 with quantity"]
    }
  ],
  "mealPrepSchedule": {
    "sunday": ["List of prep tasks to do on Sunday for the week ahead"],
    "midweek": ["Optional mid-week prep tasks"]
  },
  "tips": ["Array of 4-5 personalized nutrition and meal prep tips"],
  "cautions": ["Array of 1-3 dietary cautions based on restrictions/allergies/goals"]
}

Provide a 5-7 day weekly plan. Ensure meals are practical, budget-conscious, and suitable for meal prepping. Account for dietary restrictions and allergies strictly. Include variety across the week.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let parsed;
    try {
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ raw: text });
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate meal plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
