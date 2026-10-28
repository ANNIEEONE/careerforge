import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateCoverLetter } from "@/lib/ai";
import { ResumeData } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, jobTitle, company, jobDescription, tone } = body;

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "Target job title and company are required." },
        { status: 400 }
      );
    }

    let parsedResume: ResumeData;

    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: user.id },
      });
      if (!resume) {
        return NextResponse.json({ error: "Resume not found." }, { status: 404 });
      }

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
        templateId: "modern",
        typography: JSON.parse(resume.typography || "{}"),
        layoutConfig: JSON.parse(resume.layoutConfig || "{}"),
        isPublic: resume.isPublic,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
      };
    } else {
      // Use fallback candidate info if no specific resume was selected
      parsedResume = {
        id: "temp",
        userId: user.id,
        title: "Default Profile",
        summary: "Dedicated professional with extensive experience.",
        personalInfo: {
          fullName: user.name,
          email: user.email,
          phone: "",
          location: "",
          jobTitle: jobTitle,
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        achievements: [],
        languages: [],
        customSections: [],
        sectionOrder: [],
        sectionVisibility: {},
        templateId: "modern",
        typography: { font: "inter", fontSize: "normal", accentColor: "#2563eb", lineHeight: "normal" },
        layoutConfig: { paperFormat: "a4", margins: "normal", showIcons: true },
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { geminiApiKey: true },
    });

    const { content, engine } = await generateCoverLetter({
      resume: parsedResume,
      jobTitle,
      company,
      jobDescription,
      tone,
      apiKey: dbUser?.geminiApiKey,
    });

    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: user.id,
        resumeId: resumeId || null,
        jobTitle,
        company,
        jobDescription,
        content,
        tone: tone || "professional",
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      coverLetter: {
        id: coverLetter.id,
        content: coverLetter.content,
        jobTitle: coverLetter.jobTitle,
        company: coverLetter.company,
        tone: coverLetter.tone,
        createdAt: coverLetter.createdAt,
      },
      engine,
    });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter. Please try again." },
      { status: 500 }
    );
  }
}
