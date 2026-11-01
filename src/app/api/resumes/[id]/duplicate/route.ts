import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serverStore } from "@/lib/server-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const original = await prisma.resume.findFirst({
      where: { id },
    });

    if (original) {
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

      return NextResponse.json({ resume: duplicated }, { status: 201 });
    }
  } catch {
    // Prisma fallback
  }

  const duplicated = serverStore.duplicateResume(id, user.id);
  if (duplicated) {
    return NextResponse.json({ resume: duplicated }, { status: 201 });
  }

  return NextResponse.json({ error: "Resume not found." }, { status: 404 });
}
