import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ResumeData } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const parsedResume: ResumeData = {
    id: resume.id,
    userId: resume.userId,
    title: resume.title,
    targetRole: resume.targetRole || "",
    targetCompany: resume.targetCompany || "",
    summary: resume.summary || "",
    personalInfo: JSON.parse(resume.personalInfo || "{}"),
    experience: JSON.parse(resume.experience || "[]"),
    education: JSON.parse(resume.education || "[]"),
    skills: JSON.parse(resume.skills || "[]"),
    projects: JSON.parse(resume.projects || "[]"),
    certifications: JSON.parse(resume.certifications || "[]"),
    achievements: JSON.parse(resume.achievements || "[]"),
    languages: JSON.parse(resume.languages || "[]"),
    customSections: JSON.parse(resume.customSections || "[]"),
    sectionOrder: JSON.parse(
      resume.sectionOrder ||
        "[\"summary\",\"experience\",\"education\",\"skills\",\"projects\",\"certifications\",\"achievements\",\"languages\",\"customSections\"]"
    ),
    sectionVisibility: JSON.parse(resume.sectionVisibility || "{}"),
    templateId: (resume.templateId as ResumeData["templateId"]) || "modern",
    typography: JSON.parse(
      resume.typography ||
        "{\"font\":\"inter\",\"fontSize\":\"normal\",\"accentColor\":\"#2563eb\",\"lineHeight\":\"normal\"}"
    ),
    layoutConfig: JSON.parse(
      resume.layoutConfig || "{\"paperFormat\":\"a4\",\"margins\":\"normal\",\"showIcons\":true}"
    ),
    isPublic: resume.isPublic,
    shareSlug: resume.shareSlug || undefined,
    lastAtsScore: resume.lastAtsScore || undefined,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };

  return NextResponse.json({ resume: parsedResume });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const body = await request.json();

  // Entitlement enforcement: Pro templates require PRO plan
  const proTemplates = [
    "executive",
    "technical",
    "creative",
    "swiss-sidebar",
    "editorial-luxury",
    "nordic-clean",
  ];
  if (body.templateId && proTemplates.includes(body.templateId) && user.plan !== "PRO") {
    return NextResponse.json(
      {
        error: "The selected template requires a Pro subscription.",
        requiresPro: true,
      },
      { status: 403 }
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.title !== undefined) updateData.title = body.title;
  if (body.targetRole !== undefined) updateData.targetRole = body.targetRole;
  if (body.targetCompany !== undefined) updateData.targetCompany = body.targetCompany;
  if (body.summary !== undefined) updateData.summary = body.summary;
  if (body.personalInfo !== undefined) updateData.personalInfo = JSON.stringify(body.personalInfo);
  if (body.experience !== undefined) updateData.experience = JSON.stringify(body.experience);
  if (body.education !== undefined) updateData.education = JSON.stringify(body.education);
  if (body.skills !== undefined) updateData.skills = JSON.stringify(body.skills);
  if (body.projects !== undefined) updateData.projects = JSON.stringify(body.projects);
  if (body.certifications !== undefined) updateData.certifications = JSON.stringify(body.certifications);
  if (body.achievements !== undefined) updateData.achievements = JSON.stringify(body.achievements);
  if (body.languages !== undefined) updateData.languages = JSON.stringify(body.languages);
  if (body.customSections !== undefined) updateData.customSections = JSON.stringify(body.customSections);
  if (body.sectionOrder !== undefined) updateData.sectionOrder = JSON.stringify(body.sectionOrder);
  if (body.sectionVisibility !== undefined) updateData.sectionVisibility = JSON.stringify(body.sectionVisibility);
  if (body.templateId !== undefined) updateData.templateId = body.templateId;
  if (body.typography !== undefined) updateData.typography = JSON.stringify(body.typography);
  if (body.layoutConfig !== undefined) updateData.layoutConfig = JSON.stringify(body.layoutConfig);
  if (body.isPublic !== undefined) updateData.isPublic = Boolean(body.isPublic);
  if (body.lastAtsScore !== undefined) updateData.lastAtsScore = body.lastAtsScore;

  const updated = await prisma.resume.update({
    where: { id },
    data: updateData,
  });

  // Check version history throttle: create a version if no version was created in the last 10 minutes
  const latestVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId: id },
    orderBy: { createdAt: "desc" },
  });

  const shouldCreateVersion =
    !latestVersion || Date.now() - latestVersion.createdAt.getTime() > 1000 * 60 * 10;

  if (shouldCreateVersion) {
    const nextVersionNum = (latestVersion?.versionNumber || 0) + 1;
    await prisma.resumeVersion.create({
      data: {
        resumeId: id,
        versionNumber: nextVersionNum,
        changeSummary: body.versionSummary || "Autosave snapshot",
        snapshot: JSON.stringify(updated),
      },
    });
  }

  return NextResponse.json({ success: true, updatedAt: updated.updatedAt });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  await prisma.resume.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
