import { NextRequest, NextResponse } from "next/server";
import {
  saveAIPlan,
  getUserAIPlans,
  deleteAIPlan,
  toggleActivePlan,
  getActivePlan,
} from "@/app/lib/supabase/workouts";
import { auth } from "@clerk/nextjs/server";

// POST /api/plans — Save a plan, delete a plan, or toggle active
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "save": {
        if (!body.form_data || !body.plan_data) {
          return NextResponse.json(
            { error: "form_data and plan_data required" },
            { status: 400 },
          );
        }
        const plan = await saveAIPlan({
          user_id: userId,
          name: body.name || "Untitled Plan",
          form_data: body.form_data,
          plan_data: body.plan_data,
          summary: body.summary || null,
          is_active: body.is_active ?? false,
        });
        return NextResponse.json({ plan });
      }

      case "delete": {
        if (!body.plan_id) {
          return NextResponse.json(
            { error: "plan_id required" },
            { status: 400 },
          );
        }
        await deleteAIPlan(body.plan_id, userId);
        return NextResponse.json({ success: true });
      }

      case "activate": {
        if (!body.plan_id) {
          return NextResponse.json(
            { error: "plan_id required" },
            { status: 400 },
          );
        }
        const plan = await toggleActivePlan(body.plan_id, userId);
        return NextResponse.json({ plan });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

// GET /api/plans — Get saved plans or active plan
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all";

    if (type === "active") {
      const plan = await getActivePlan(userId);
      return NextResponse.json({ plan });
    }

    const limit = parseInt(url.searchParams.get("limit") || "10");
    const plans = await getUserAIPlans(userId, limit);
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
