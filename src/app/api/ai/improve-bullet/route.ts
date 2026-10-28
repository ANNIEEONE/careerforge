import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { improveBulletPoint } from "@/lib/ai";

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

    const body = await request.json();
    const { bullet, role, company } = body;

    if (!bullet || bullet.trim().length === 0) {
      return NextResponse.json({ error: "Bullet text is required." }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { geminiApiKey: true },
    });

    const result = await improveBulletPoint({
      bullet,
      role,
      company,
      apiKey: dbUser?.geminiApiKey,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      improved: result.improved,
      suggestions: result.suggestions,
      engine: result.engine,
      creditsRemaining: user.plan === "PRO" ? "Unlimited" : Math.max(0, user.aiCreditsLimit - (user.aiCreditsUsed + 1)),
    });
  } catch (error) {
    console.error("AI Bullet improvement error:", error);
    return NextResponse.json(
      { error: "Failed to improve bullet. Please try again." },
      { status: 500 }
    );
  }
}
