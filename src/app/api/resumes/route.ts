import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDefaultResumeData } from "@/lib/defaults";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      targetRole: true,
      targetCompany: true,
      templateId: true,
      lastAtsScore: true,
      isPublic: true,
      shareSlug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Enforce Free Tier Resume Limit (Max 3 resumes for Free users)
  if (user.plan === "FREE") {
    const resumeCount = await prisma.resume.count({
      where: { userId: user.id },
    });
    if (resumeCount >= 3) {
      return NextResponse.json(
        {
          error: "Free plan limit reached (maximum 3 resumes). Please upgrade to Pro for unlimited resumes.",
          limitReached: true,
        },
        { status: 403 }
      );
    }
  }

  const body = await request.json().catch(() => ({}));
  const defaultData = getDefaultResumeData(user.id, {
    title: body.title,
    targetRole: body.targetRole,
    fullName: user.name,
    email: user.email,
  });

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: body.title || defaultData.title,
      targetRole: body.targetRole || defaultData.targetRole,
      targetCompany: body.targetCompany || defaultData.targetCompany,
      summary: body.summary || defaultData.summary,
      personalInfo: JSON.stringify(body.personalInfo || defaultData.personalInfo),
      experience: JSON.stringify(body.experience || defaultData.experience),
      education: JSON.stringify(body.education || defaultData.education),
      skills: JSON.stringify(body.skills || defaultData.skills),
      projects: JSON.stringify(body.projects || defaultData.projects),
      certifications: JSON.stringify(body.certifications || defaultData.certifications),
      achievements: JSON.stringify(body.achievements || defaultData.achievements),
      languages: JSON.stringify(body.languages || defaultData.languages),
      customSections: JSON.stringify(body.customSections || defaultData.customSections),
      sectionOrder: JSON.stringify(body.sectionOrder || defaultData.sectionOrder),
      sectionVisibility: JSON.stringify(body.sectionVisibility || defaultData.sectionVisibility),
      templateId: body.templateId || defaultData.templateId,
      typography: JSON.stringify(body.typography || defaultData.typography),
      layoutConfig: JSON.stringify(body.layoutConfig || defaultData.layoutConfig),
      shareSlug: defaultData.shareSlug,
      lastAtsScore: defaultData.lastAtsScore,
    },
  });

  // Create initial version snapshot
  await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      versionNumber: 1,
      changeSummary: "Initial version created",
      snapshot: JSON.stringify(resume),
    },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
