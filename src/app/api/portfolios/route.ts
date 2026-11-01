import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        resume: {
          select: { id: true, title: true, targetRole: true },
        },
      },
    });

    if (portfolios && portfolios.length > 0) {
      return NextResponse.json({ portfolios });
    }
  } catch {
    // Prisma fallback
  }

  const stored = serverStore.getPortfoliosByUserId(user.id);
  const portfoliosWithResume = stored.map((p) => {
    const resume = p.resumeId ? serverStore.getResumeById(p.resumeId) : null;
    return {
      ...p,
      resume: resume ? { id: resume.id, title: resume.title, targetRole: resume.targetRole } : null,
    };
  });

  return NextResponse.json({ portfolios: portfoliosWithResume });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { resumeId, title, theme, customSlug } = body;

  try {
    let resumeData = null;
    if (resumeId) {
      resumeData = await prisma.resume.findFirst({
        where: { id: resumeId },
      });
    }

    const baseSlug = (customSlug || user.name || "portfolio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        resumeId: resumeData?.id || null,
        slug: `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`,
        title: title || `${user.name}'s Portfolio`,
        tagline: resumeData?.targetRole || "Software Engineer & Builder",
        bio: resumeData?.summary || "Welcome to my personal portfolio. Explore my background, projects, and expertise.",
        theme: theme || "tech-dark",
        accentColor: "#2563eb",
        sectionsConfig: JSON.stringify({
          showAbout: true,
          showExperience: true,
          showProjects: true,
          showSkills: true,
          showEducation: true,
          showContact: true,
        }),
        customLinks: JSON.stringify([
          { label: "GitHub", url: "https://github.com", icon: "github" },
          { label: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
        ]),
        isPublished: true,
      },
    });

    return NextResponse.json({ portfolio }, { status: 201 });
  } catch {
    // Fallback store
    const portfolio = serverStore.createPortfolio(user.id, {
      resumeId,
      title,
      theme,
      slug: customSlug,
    });
    return NextResponse.json({ portfolio }, { status: 201 });
  }
}
