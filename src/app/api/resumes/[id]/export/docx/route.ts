import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateResumeDocx } from "@/lib/docx-export";
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
    sectionOrder: JSON.parse(resume.sectionOrder || "[]"),
    sectionVisibility: JSON.parse(resume.sectionVisibility || "{}"),
    templateId: (resume.templateId as ResumeData["templateId"]) || "modern",
    typography: JSON.parse(resume.typography || "{}"),
    layoutConfig: JSON.parse(resume.layoutConfig || "{}"),
    isPublic: resume.isPublic,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };

  const buffer = await generateResumeDocx(parsedResume);
  const filename = `${resume.title.replace(/[^a-zA-Z0-9_-]/g, "_") || "resume"}.docx`;

  const uint8 = new Uint8Array(buffer);
  return new Response(uint8, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
