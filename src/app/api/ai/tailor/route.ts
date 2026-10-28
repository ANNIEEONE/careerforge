import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tailorResumeToJob } from "@/lib/ai";
import { ResumeData } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, jobTitle, company, jobDescription } = body;

    if (!resumeId || !jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "Resume ID, job title, and job description are required." },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Check plan limits: Free users can perform up to 2 job tailoring scans, Pro has unlimited
    if (user.plan === "FREE") {
      const pastTailorings = await prisma.jobTailoring.count({
        where: { resume: { userId: user.id } },
      });
      if (pastTailorings >= 2 && user.aiCreditsUsed >= user.aiCreditsLimit) {
        return NextResponse.json(
          {
            error: "Job-description tailoring is an advanced Pro feature. You have used your free preview scans. Upgrade to Pro for unlimited scans.",
            requiresPro: true,
          },
          { status: 403 }
        );
      }
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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { geminiApiKey: true },
    });

    const { result, engine } = await tailorResumeToJob({
      resume: parsedResume,
      jobTitle,
      company: company || "Target Company",
      jobDescription,
      apiKey: dbUser?.geminiApiKey,
    });

    // Save job tailoring record
    const record = await prisma.jobTailoring.create({
      data: {
        resumeId: resume.id,
        jobTitle,
        company: company || "Target Company",
        jobDescription,
        matchScore: result.matchScore,
        matchingKeywords: JSON.stringify(result.matchingKeywords),
        missingKeywords: JSON.stringify(result.missingKeywords),
        recommendations: JSON.stringify(result.recommendations),
        tailoredSummary: result.tailoredSummary,
        tailoredBullets: JSON.stringify(result.tailoredBullets || {}),
      },
    });

    // Update resume with latest ATS score
    await prisma.resume.update({
      where: { id: resume.id },
      data: { lastAtsScore: result.matchScore },
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      tailoringId: record.id,
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
