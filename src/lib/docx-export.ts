import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
} from "docx";
import { ResumeData } from "./types";

export async function generateResumeDocx(resume: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Header: Full Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: resume.personalInfo.fullName || "Untitled Candidate",
          bold: true,
          size: 32, // 16pt
          font: "Calibri",
        }),
      ],
    })
  );

  // Job Title
  if (resume.personalInfo.jobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: resume.personalInfo.jobTitle,
            size: 24, // 12pt
            color: "555555",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // Contact Info Line
  const contactParts: string[] = [];
  if (resume.personalInfo.email) contactParts.push(resume.personalInfo.email);
  if (resume.personalInfo.phone) contactParts.push(resume.personalInfo.phone);
  if (resume.personalInfo.location) contactParts.push(resume.personalInfo.location);
  if (resume.personalInfo.linkedin) contactParts.push(resume.personalInfo.linkedin);
  if (resume.personalInfo.github) contactParts.push(resume.personalInfo.github);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 18,
            color: "666666",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // Helper for Section Heading
  const addSectionHeader = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            font: "Calibri",
            color: "111827",
          }),
        ],
      })
    );
  };

  // Professional Summary
  if (resume.summary && resume.sectionVisibility?.summary !== false) {
    addSectionHeader("Professional Summary");
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: resume.summary,
            size: 20,
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // Work Experience
  if (resume.experience?.length > 0 && resume.sectionVisibility?.experience !== false) {
    addSectionHeader("Work Experience");
    for (const exp of resume.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
              size: 20,
              font: "Calibri",
            }),
            new TextRun({
              text: ` — ${exp.company}`,
              bold: true,
              color: "374151",
              size: 20,
              font: "Calibri",
            }),
            new TextRun({
              text: `  (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})`,
              italics: true,
              color: "6B7280",
              size: 18,
              font: "Calibri",
            }),
          ],
        })
      );

      if (exp.location) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: exp.location,
                italics: true,
                size: 18,
                color: "6B7280",
                font: "Calibri",
              }),
            ],
          })
        );
      }

      for (const bullet of exp.bullets) {
        if (!bullet.trim()) continue;
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: bullet.replace(/^[-*•]\s*/, ""),
                size: 20,
                font: "Calibri",
              }),
            ],
          })
        );
      }
    }
  }

  // Education
  if (resume.education?.length > 0 && resume.sectionVisibility?.education !== false) {
    addSectionHeader("Education");
    for (const edu of resume.education) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.fieldOfStudy}`,
              bold: true,
              size: 20,
              font: "Calibri",
            }),
            new TextRun({
              text: ` — ${edu.institution}`,
              size: 20,
              font: "Calibri",
            }),
            new TextRun({
              text: `  (${edu.startDate} - ${edu.endDate})`,
              italics: true,
              color: "6B7280",
              size: 18,
              font: "Calibri",
            }),
          ],
        })
      );
    }
  }

  // Skills
  if (resume.skills?.length > 0 && resume.sectionVisibility?.skills !== false) {
    addSectionHeader("Technical Skills & Competencies");
    for (const cat of resume.skills) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              size: 20,
              font: "Calibri",
            }),
            new TextRun({
              text: cat.items.join(", "),
              size: 20,
              font: "Calibri",
            }),
          ],
        })
      );
    }
  }

  // Projects
  if (resume.projects?.length > 0 && resume.sectionVisibility?.projects !== false) {
    addSectionHeader("Key Projects");
    for (const proj of resume.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: proj.title,
              bold: true,
              size: 20,
              font: "Calibri",
            }),
            ...(proj.role ? [new TextRun({ text: ` — ${proj.role}`, italics: true, size: 18, font: "Calibri" })] : []),
          ],
        })
      );
      if (proj.description) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: proj.description, size: 20, font: "Calibri" })],
          })
        );
      }
      for (const bullet of proj.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 30 },
            children: [new TextRun({ text: bullet.replace(/^[-*•]\s*/, ""), size: 20, font: "Calibri" })],
          })
        );
      }
    }
  }

  // Certifications
  if (resume.certifications?.length > 0 && resume.sectionVisibility?.certifications !== false) {
    addSectionHeader("Certifications");
    for (const cert of resume.certifications) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: cert.name, bold: true, size: 20, font: "Calibri" }),
            new TextRun({ text: ` — ${cert.issuer} (${cert.issueDate})`, size: 18, color: "6B7280", font: "Calibri" }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
