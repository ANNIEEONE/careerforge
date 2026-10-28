import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { suggestSkillsForRole } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.plan === "FREE" && user.aiCreditsUsed >= user.aiCreditsLimit) {
      return NextResponse.json(
        {
          error: `Monthly AI quota reached (${user.aiCreditsLimit}/${user.aiCreditsLimit}). Upgrade to Pro for unlimited AI suggestions.`,
          quotaExceeded: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetRole, existingSkills = [] } = body;

    if (!targetRole) {
      return NextResponse.json({ error: "Target role is required." }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { geminiApiKey: true },
    });

    const result = await suggestSkillsForRole({
      targetRole,
      existingSkills,
      apiKey: dbUser?.geminiApiKey,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      suggested: result.suggested,
      categories: result.categories,
      engine: result.engine,
      creditsRemaining: user.plan === "PRO" ? "Unlimited" : Math.max(0, user.aiCreditsLimit - (user.aiCreditsUsed + 1)),
    });
  } catch (error) {
    console.error("AI Skill suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to suggest skills. Please try again." },
      { status: 500 }
    );
  }
}
