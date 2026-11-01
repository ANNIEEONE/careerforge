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

    if (user.plan === "FREE" && user.aiCreditsUsed >= user.aiCreditsLimit) {
      return NextResponse.json(
        {
          error: `Monthly AI generation quota reached (${user.aiCreditsLimit}/${user.aiCreditsLimit}). Upgrade to Pro for unlimited AI writing assistance.`,
          quotaExceeded: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { targetRole, experienceYears, keySkills = [], currentSummary } = body;

    if (!targetRole && keySkills.length === 0 && !currentSummary) {
      return NextResponse.json(
        { error: "Please provide a target role or skills to generate a summary." },
        { status: 400 }
      );
    }

    let customKey: string | null = null;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { geminiApiKey: true },
      });
      customKey = dbUser?.geminiApiKey || null;
    } catch {
      // Prisma fallback
    }

    const result = await generateProfessionalSummary({
      targetRole: targetRole || "Professional",
      experienceYears,
      keySkills,
      currentSummary,
      apiKey: customKey,
    });

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { aiCreditsUsed: { increment: 1 } },
      });
    } catch {
      // Prisma fallback
    }

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
