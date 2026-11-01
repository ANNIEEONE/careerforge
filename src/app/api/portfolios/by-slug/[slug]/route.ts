import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverStore } from "@/lib/server-store";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        resume: true,
      },
    });

    if (portfolio && portfolio.isPublished) {
      let parsedResume = null;
      if (portfolio.resume) {
        parsedResume = {
          title: portfolio.resume.title,
          targetRole: portfolio.resume.targetRole,
          summary: portfolio.resume.summary,
          personalInfo: JSON.parse(portfolio.resume.personalInfo || "{}"),
          experience: JSON.parse(portfolio.resume.experience || "[]"),
          education: JSON.parse(portfolio.resume.education || "[]"),
          skills: JSON.parse(portfolio.resume.skills || "[]"),
          projects: JSON.parse(portfolio.resume.projects || "[]"),
          certifications: JSON.parse(portfolio.resume.certifications || "[]"),
          achievements: JSON.parse(portfolio.resume.achievements || "[]"),
          languages: JSON.parse(portfolio.resume.languages || "[]"),
          typography: JSON.parse(portfolio.resume.typography || "{}"),
        };
      }

      return NextResponse.json({
        portfolio: {
          id: portfolio.id,
          slug: portfolio.slug,
          title: portfolio.title,
          tagline: portfolio.tagline,
          bio: portfolio.bio,
          theme: portfolio.theme,
          accentColor: portfolio.accentColor,
          sectionsConfig: JSON.parse(portfolio.sectionsConfig || "{}"),
          customLinks: JSON.parse(portfolio.customLinks || "[]"),
          viewsCount: portfolio.viewsCount,
          user: portfolio.user,
          resume: parsedResume,
        },
      });
    }
  } catch {
    // Prisma fallback
  }

  const stored = serverStore.getPortfolioBySlug(slug);
  if (stored) {
    const resume = stored.resumeId ? serverStore.getResumeById(stored.resumeId) : null;
    return NextResponse.json({
      portfolio: {
        id: stored.id,
        slug: stored.slug,
        title: stored.title,
        tagline: stored.tagline,
        bio: stored.bio,
        theme: stored.theme,
        accentColor: stored.accentColor,
        sectionsConfig: stored.sectionsConfig,
        customLinks: stored.customLinks,
        viewsCount: stored.viewsCount,
        user: { name: "Alex Rivera", email: "alex.rivera@example.com" },
        resume,
      },
    });
  }

  return NextResponse.json(
    { error: "Portfolio is private or does not exist." },
    { status: 404 }
  );
}
