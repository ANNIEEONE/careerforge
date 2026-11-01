import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tailorResumeToJob } from "@/lib/ai";
import { ResumeData } from "@/lib/types";
import { serverStore } from "@/lib/server-store";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { resumeId, jobTitle, company, jobDescription } = body;

    if (!resumeId || !jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "Resume ID, job title, and job description are required." },
        { status: 400 }
      );
    }

    let parsedResume: ResumeData | null = null;

    try {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId },
      });

      if (resume) {
        parsedResume = {
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
      }
    } catch {
      // Prisma fallback
    }

    if (!parsedResume) {
      parsedResume = serverStore.getResumeById(resumeId) || serverStore.getResumeById("demo-resume-1");
    }

    if (!parsedResume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    let customKey: string | null = null;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { geminiApiKey: true },
      });
      customKey = dbUser?.geminiApiKey || null;
    } catch {
      // Prisma fallback
    }

    const { result, engine } = await tailorResumeToJob({
      resume: parsedResume,
      jobTitle,
      company: company || "Target Company",
      jobDescription,
      apiKey: customKey,
    });

    try {
      await prisma.resume.update({
        where: { id: parsedResume.id },
        data: { lastAtsScore: result.matchScore },
      });
    } catch {
      serverStore.updateResume(parsedResume.id, { lastAtsScore: result.matchScore });
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { aiCreditsUsed: { increment: 1 } },
      });
    } catch {
      // Fallback
    }

    return NextResponse.json({
      tailoringId: `tailor-${Date.now()}`,
      result,
      engine,
      creditsRemaining: user.plan === "PRO" ? "Unlimited" : Math.max(0, user.aiCreditsLimit - (user.aiCreditsUsed + 1)),
    });
  } catch (error) {
    console.error("AI Tailor error:", error);
    return NextResponse.json(
      { error: "Failed to tailor resume to job description. Please try again." },
      { status: 500 }
    );
  }
}
