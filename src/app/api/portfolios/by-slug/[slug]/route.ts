import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

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

  if (!portfolio || !portfolio.isPublished) {
    return NextResponse.json(
      { error: "Portfolio is private or does not exist." },
      { status: 404 }
    );
  }

  // Asynchronously increment view count without blocking response
  prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

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
