import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      resume: {
        select: { id: true, title: true, targetRole: true },
      },
    },
  });

  return NextResponse.json({ portfolios });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { resumeId, title, theme, customSlug } = body;

  let resumeData = null;
  if (resumeId) {
    resumeData = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });
  }

  // Generate unique slug
  const baseSlug = (customSlug || user.name || "portfolio")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 1;
  while (await prisma.portfolio.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const portfolio = await prisma.portfolio.create({
    data: {
      userId: user.id,
      resumeId: resumeData?.id || null,
      slug,
      title: title || `${user.name}'s Portfolio`,
      tagline: resumeData?.targetRole || "Software Engineer & Builder",
      bio: resumeData?.summary || "Welcome to my personal portfolio. Explore my background, projects, and expertise.",
      theme: theme || "minimal-slate",
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
      isPublished: true, // published by default
    },
  });

  return NextResponse.json({ portfolio }, { status: 201 });
}
