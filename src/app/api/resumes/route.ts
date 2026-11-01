import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDefaultResumeData } from "@/lib/defaults";
import { serverStore } from "@/lib/server-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let resumes: Array<{
    id: string;
    title: string;
    targetRole: string | null;
    targetCompany: string | null;
    templateId: string;
    lastAtsScore: number | null;
    isPublic: boolean;
    shareSlug: string | null;
    createdAt: string;
    updatedAt: string;
  }> = [];

  try {
    const dbResumes = await prisma.resume.findMany({
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

    if (dbResumes && dbResumes.length > 0) {
      resumes = dbResumes.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Prisma error or serverless cold start
  }

  if (resumes.length === 0) {
    const stored = serverStore.getResumesByUserId(user.id);
    resumes = stored.map((r) => ({
      id: r.id,
      title: r.title,
      targetRole: r.targetRole || null,
      targetCompany: r.targetCompany || null,
      templateId: r.templateId,
      lastAtsScore: r.lastAtsScore || null,
      isPublic: r.isPublic,
      shareSlug: r.shareSlug || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const defaultData = getDefaultResumeData(user.id, {
    title: body.title,
    targetRole: body.targetRole,
    fullName: user.name,
    email: user.email,
  });

  try {
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

    return NextResponse.json({ resume }, { status: 201 });
  } catch {
    // Prisma fallback to serverStore
    const newResume = serverStore.createResume(user.id, {
      title: body.title || defaultData.title,
      targetRole: body.targetRole || defaultData.targetRole,
      targetCompany: body.targetCompany || defaultData.targetCompany,
      summary: body.summary || defaultData.summary,
      personalInfo: body.personalInfo || defaultData.personalInfo,
      experience: body.experience || defaultData.experience,
      education: body.education || defaultData.education,
      skills: body.skills || defaultData.skills,
      projects: body.projects || defaultData.projects,
      certifications: body.certifications || defaultData.certifications,
      achievements: body.achievements || defaultData.achievements,
      languages: body.languages || defaultData.languages,
      customSections: body.customSections || defaultData.customSections,
      sectionOrder: body.sectionOrder || defaultData.sectionOrder,
      sectionVisibility: body.sectionVisibility || defaultData.sectionVisibility,
      templateId: body.templateId || defaultData.templateId,
      typography: body.typography || defaultData.typography,
      layoutConfig: body.layoutConfig || defaultData.layoutConfig,
      shareSlug: defaultData.shareSlug,
      lastAtsScore: defaultData.lastAtsScore,
    });

    return NextResponse.json({ resume: newResume }, { status: 201 });
  }
}
