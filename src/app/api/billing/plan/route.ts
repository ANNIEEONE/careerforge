import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      subscription: true,
      _count: {
        select: {
          resumes: true,
          portfolios: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    plan: user.plan,
    aiCreditsUsed: user.aiCreditsUsed,
    aiCreditsLimit: user.plan === "PRO" ? 999999 : user.aiCreditsLimit,
    resumeCount: user._count.resumes,
    resumeLimit: user.plan === "PRO" ? "Unlimited" : 3,
    portfolioCount: user._count.portfolios,
    portfolioLimit: user.plan === "PRO" ? "Unlimited" : 1,
    subscriptionStatus: user.subscription?.status || "active",
    features: {
      unlimitedResumes: user.plan === "PRO",
      allTemplates: user.plan === "PRO",
      unlimitedAi: user.plan === "PRO",
      jobTailoring: user.plan === "PRO",
      coverLetterGenerator: user.plan === "PRO",
      publicPortfolios: true,
      docxExport: true,
      pdfExport: true,
    },
  });
}
