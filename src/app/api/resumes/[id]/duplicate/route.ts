import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Plan Limit Check for Free Tier
  if (user.plan === "FREE") {
    const resumeCount = await prisma.resume.count({
      where: { userId: user.id },
    });
    if (resumeCount >= 3) {
      return NextResponse.json(
        {
          error: "Free plan limit reached (maximum 3 resumes). Upgrade to Pro for unlimited resumes.",
          limitReached: true,
        },
        { status: 403 }
      );
    }
  }

  const { id } = await params;
  const original = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!original) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const duplicated = await prisma.resume.create({
    data: {
      userId: user.id,
      title: `${original.title} (Copy)`,
      targetRole: original.targetRole,
      targetCompany: original.targetCompany,
      summary: original.summary,
      personalInfo: original.personalInfo,
      experience: original.experience,
      education: original.education,
      skills: original.skills,
      projects: original.projects,
      certifications: original.certifications,
      achievements: original.achievements,
      languages: original.languages,
      customSections: original.customSections,
      sectionOrder: original.sectionOrder,
      sectionVisibility: original.sectionVisibility,
      templateId: original.templateId,
      typography: original.typography,
      layoutConfig: original.layoutConfig,
      shareSlug: `${original.shareSlug || "resume"}-${Math.random().toString(36).substring(2, 6)}`,
      lastAtsScore: original.lastAtsScore,
    },
  });

  await prisma.resumeVersion.create({
    data: {
      resumeId: duplicated.id,
      versionNumber: 1,
      changeSummary: `Duplicated from ${original.title}`,
      snapshot: JSON.stringify(duplicated),
    },
  });

  return NextResponse.json({ resume: duplicated }, { status: 201 });
}
