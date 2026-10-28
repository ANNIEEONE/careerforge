import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateProfessionalSummary } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AI Credit Enforcement for Free tier
    if (user.plan === "FREE" && user.aiCreditsUsed >= user.aiCreditsLimit) {
      return NextResponse.json(
        {
          error: `Monthly AI generation quota reached (${user.aiCreditsLimit}/${user.aiCreditsLimit}). Upgrade to Pro for unlimited AI writing assistance.`,
          quotaExceeded: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetRole, experienceYears, keySkills = [], currentSummary } = body;

    if (!targetRole && keySkills.length === 0 && !currentSummary) {
      return NextResponse.json(
        { error: "Please provide a target role or skills to generate a summary." },
        { status: 400 }
      );
    }

    // Fetch user custom API key if saved
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { geminiApiKey: true },
    });

    const result = await generateProfessionalSummary({
      targetRole: targetRole || "Professional",
      experienceYears,
      keySkills,
      currentSummary,
      apiKey: dbUser?.geminiApiKey,
    });

    // Increment AI credits used
    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      summary: result.summary,
      engine: result.engine,
      creditsRemaining: user.plan === "PRO" ? "Unlimited" : Math.max(0, user.aiCreditsLimit - (user.aiCreditsUsed + 1)),
    });
  } catch (error) {
    console.error("AI Summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary. Please try again." },
      { status: 500 }
    );
  }
}
