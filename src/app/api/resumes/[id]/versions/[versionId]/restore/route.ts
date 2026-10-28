import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string; versionId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, versionId } = await params;
  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const version = await prisma.resumeVersion.findFirst({
    where: { id: versionId, resumeId: id },
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found." }, { status: 404 });
  }

  const snapshot = JSON.parse(version.snapshot);

  await prisma.resume.update({
    where: { id },
    data: {
      title: snapshot.title,
      targetRole: snapshot.targetRole,
      targetCompany: snapshot.targetCompany,
      summary: snapshot.summary,
      personalInfo: snapshot.personalInfo,
      experience: snapshot.experience,
      education: snapshot.education,
      skills: snapshot.skills,
      projects: snapshot.projects,
      certifications: snapshot.certifications,
      achievements: snapshot.achievements,
      languages: snapshot.languages,
      customSections: snapshot.customSections,
      sectionOrder: snapshot.sectionOrder,
      sectionVisibility: snapshot.sectionVisibility,
      templateId: snapshot.templateId,
      typography: snapshot.typography,
      layoutConfig: snapshot.layoutConfig,
    },
  });

  return NextResponse.json({ success: true, message: `Restored to version ${version.versionNumber}` });
}
