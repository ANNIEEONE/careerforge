import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { extractTextFromBuffer, parseResumeText } from "@/lib/parser";
import { getDefaultResumeData } from "@/lib/defaults";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check free plan resume limit
    if (user.plan === "FREE") {
      const count = await prisma.resume.count({ where: { userId: user.id } });
      if (count >= 3) {
        return NextResponse.json(
          {
            error: "Free plan limit reached (maximum 3 resumes). Upgrade to Pro to import more resumes.",
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const saveDirectly = formData.get("save") !== "false";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Max 6MB
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 6MB size limit. Please upload a smaller file." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let fileType: "pdf" | "docx" | "txt" = "txt";

    if (fileName.endsWith(".pdf")) {
      fileType = "pdf";
    } else if (fileName.endsWith(".docx")) {
      fileType = "docx";
    } else if (fileName.endsWith(".txt")) {
      fileType = "txt";
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a PDF, DOCX, or TXT document." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawText = await extractTextFromBuffer(buffer, fileType);
    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Could not extract sufficient text from this document. It may be an image scan or password-protected.",
        },
        { status: 422 }
      );
    }

    const parsed = parseResumeText(rawText);
    const defaults = getDefaultResumeData(user.id);

    // Merge parsed data with structural defaults
    const resumeTitle = parsed.personalInfo.fullName
      ? `${parsed.personalInfo.fullName} - Imported Resume`
      : `${file.name.replace(/\.[^/.]+$/, "")} Resume`;

    if (saveDirectly) {
      const created = await prisma.resume.create({
        data: {
          userId: user.id,
          title: resumeTitle,
          targetRole: parsed.personalInfo.jobTitle || defaults.targetRole,
          summary: parsed.summary || defaults.summary,
          personalInfo: JSON.stringify(parsed.personalInfo),
          experience: JSON.stringify(parsed.experience.length > 0 ? parsed.experience : defaults.experience),
          education: JSON.stringify(parsed.education.length > 0 ? parsed.education : defaults.education),
          skills: JSON.stringify(parsed.skills.length > 0 ? parsed.skills : defaults.skills),
          projects: JSON.stringify(parsed.projects),
          certifications: JSON.stringify(parsed.certifications),
          achievements: JSON.stringify(defaults.achievements),
          languages: JSON.stringify(defaults.languages),
          customSections: JSON.stringify([]),
          sectionOrder: JSON.stringify(defaults.sectionOrder),
          sectionVisibility: JSON.stringify(defaults.sectionVisibility),
          templateId: "modern",
          typography: JSON.stringify(defaults.typography),
          layoutConfig: JSON.stringify(defaults.layoutConfig),
          shareSlug: `import-${Math.random().toString(36).substring(2, 8)}`,
          lastAtsScore: parsed.completenessScore,
        },
      });

      await prisma.resumeVersion.create({
        data: {
          resumeId: created.id,
          versionNumber: 1,
          changeSummary: `Imported from ${file.name}`,
          snapshot: JSON.stringify(created),
        },
      });

      return NextResponse.json({
        success: true,
        resumeId: created.id,
        analysis: {
          completenessScore: parsed.completenessScore,
          extractedSections: parsed.extractedSections,
          itemCounts: {
            experience: parsed.experience.length,
            education: parsed.education.length,
            skills: parsed.skills[0]?.items?.length || 0,
            projects: parsed.projects.length,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      parsedData: parsed,
      analysis: {
        completenessScore: parsed.completenessScore,
        extractedSections: parsed.extractedSections,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to parse document. Please check the file and try again." },
      { status: 500 }
    );
  }
}
