import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serverStore } from "@/lib/server-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id },
      include: {
        resume: true,
      },
    });

    if (portfolio) {
      let parsedResume = null;
      if (portfolio.resume) {
        parsedResume = {
          ...portfolio.resume,
          personalInfo: JSON.parse(portfolio.resume.personalInfo || "{}"),
          experience: JSON.parse(portfolio.resume.experience || "[]"),
          education: JSON.parse(portfolio.resume.education || "[]"),
          skills: JSON.parse(portfolio.resume.skills || "[]"),
          projects: JSON.parse(portfolio.resume.projects || "[]"),
          certifications: JSON.parse(portfolio.resume.certifications || "[]"),
          achievements: JSON.parse(portfolio.resume.achievements || "[]"),
          languages: JSON.parse(portfolio.resume.languages || "[]"),
          customSections: JSON.parse(portfolio.resume.customSections || "[]"),
        };
      }

      return NextResponse.json({
        portfolio: {
          ...portfolio,
          sectionsConfig: JSON.parse(portfolio.sectionsConfig || "{}"),
          customLinks: JSON.parse(portfolio.customLinks || "[]"),
          resume: parsedResume,
        },
      });
    }
  } catch {
    // Prisma fallback
  }

  const stored = serverStore.getPortfolioById(id) || serverStore.getPortfolioById("demo-port-1");
  if (stored) {
    const resume = stored.resumeId ? serverStore.getResumeById(stored.resumeId) : null;
    return NextResponse.json({
      portfolio: {
        ...stored,
        resume,
      },
    });
  }

  return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const existing = await prisma.portfolio.findFirst({
      where: { id },
    });

    if (existing) {
      const updateData: Record<string, unknown> = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.tagline !== undefined) updateData.tagline = body.tagline;
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.theme !== undefined) updateData.theme = body.theme;
      if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;
      if (body.slug !== undefined) updateData.slug = body.slug;
      if (body.resumeId !== undefined) updateData.resumeId = body.resumeId;
      if (body.sectionsConfig !== undefined) updateData.sectionsConfig = JSON.stringify(body.sectionsConfig);
      if (body.customLinks !== undefined) updateData.customLinks = JSON.stringify(body.customLinks);
      if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);

      const updated = await prisma.portfolio.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ portfolio: updated });
    }
  } catch {
    // Prisma fallback
  }

  const updated = serverStore.updatePortfolio(id, body);
  return NextResponse.json({ portfolio: updated });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.portfolio.delete({ where: { id } });
  } catch {
    // Prisma fallback
  }

  serverStore.deletePortfolio(id);
  return NextResponse.json({ success: true });
}
