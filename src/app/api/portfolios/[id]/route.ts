import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
    include: {
      resume: true,
    },
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }

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

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }

  const body = await request.json();

  // If changing slug, check uniqueness
  if (body.slug && body.slug !== existing.slug) {
    const slugExists = await prisma.portfolio.findUnique({
      where: { slug: body.slug },
    });
    if (slugExists) {
      return NextResponse.json(
        { error: "This URL slug is already taken. Please choose another." },
        { status: 409 }
      );
    }
  }

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

export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }

  await prisma.portfolio.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
