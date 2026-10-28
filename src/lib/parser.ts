import mammoth from "mammoth";
import { PersonalInfo, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificationItem } from "./types";

export interface ParsedResumeOutput {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  rawText: string;
  completenessScore: number;
  extractedSections: string[];
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt"
): Promise<string> {
  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (fileType === "pdf") {
    try {
      // Dynamic import to handle potential CommonJS/ESM variance
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err) {
      console.warn("pdf-parse failed, falling back to buffer string decode", err);
      return buffer.toString("utf-8");
    }
  }

  return buffer.toString("utf-8");
}

export function parseResumeText(rawText: string): ParsedResumeOutput {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Extract contact details
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? githubMatch[0] : "";

  // 2. Candidate Name & Job Title heuristic from top lines
  let fullName = "Candidate Name";
  let jobTitle = "Professional";
  let location = "";

  const topLines = lines.slice(0, 8);
  for (const line of topLines) {
    if (
      line.length > 2 &&
      line.length < 35 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !line.match(/\d{3}/) &&
      !line.match(/summary|experience|skills|education/i)
    ) {
      fullName = line;
      break;
    }
  }

  for (const line of topLines) {
    if (
      line !== fullName &&
      line.length < 50 &&
      (line.match(/engineer|developer|designer|manager|specialist|architect|analyst|consultant|lead/i))
    ) {
      jobTitle = line;
      break;
    }
  }

  // Location heuristic
  const locMatch = rawText.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z]+,\s*[A-Z][a-zA-Z]+)/);
  if (locMatch) {
    location = locMatch[0].trim();
  }

  // 3. Segment into sections
  const sectionKeywords = [
    { key: "summary", regex: /^(?:professional\s+)?summary|profile|about\s+me|objective$/i },
    { key: "experience", regex: /^(?:work\s+)?experience|employment|work\s+history$/i },
    { key: "education", regex: /^education|academic\s+background|qualifications$/i },
    { key: "skills", regex: /^(?:technical\s+)?skills|competencies|technologies$/i },
    { key: "projects", regex: /^(?:personal\s+)?projects|key\s+initiatives$/i },
    { key: "certifications", regex: /^certifications|credentials|licenses$/i },
  ];

  const sections: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };

  let currentSection = "";

  for (const line of lines) {
    let matchedKey = "";
    for (const sk of sectionKeywords) {
      if (sk.regex.test(line)) {
        matchedKey = sk.key;
        break;
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
    } else if (currentSection && sections[currentSection]) {
      sections[currentSection].push(line);
    }
  }

  // 4. Parse Summary
  const summary = sections.summary.join(" ").slice(0, 600);

  // 5. Parse Skills
  const rawSkills = sections.skills.join(" ");
  const skillTokens = rawSkills
    .split(/[,•|·\n\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 30);

  const skills: SkillCategory[] = [
    {
      category: "Core Competencies",
      items: Array.from(new Set(skillTokens)).slice(0, 18),
    },
  ];

  // 6. Parse Experience Entries
  const experience: ExperienceItem[] = [];
  const expLines = sections.experience;
  let currentExp: ExperienceItem | null = null;

  for (let i = 0; i < expLines.length; i++) {
    const l = expLines[i];
    const dateMatch = l.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\b.*?-(?:.*?Present|[0-9]{4})/i);

    if (dateMatch || l.match(/engineer|developer|lead|manager|analyst|director/i)) {
      if (currentExp) {
        experience.push(currentExp);
      }
      currentExp = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        company: l.split(/[-–|]/)[0]?.trim() || "Organization",
        role: l.split(/[-–|]/)[1]?.trim() || jobTitle,
        location: location || "Remote",
        startDate: "2022",
        endDate: "Present",
        current: true,
        bullets: [],
      };
    } else if (currentExp) {
      if (l.startsWith("•") || l.startsWith("-") || l.startsWith("*") || l.length > 25) {
        currentExp.bullets.push(l.replace(/^[-*•]\s*/, ""));
      }
    }
  }
  if (currentExp) experience.push(currentExp);

  // Fallback experience if none matched
  if (experience.length === 0 && expLines.length > 0) {
    experience.push({
      id: `exp-${Date.now()}`,
      company: "Company Name",
      role: jobTitle,
      location: location || "Remote",
      startDate: "2021",
      endDate: "Present",
      current: true,
      bullets: expLines.slice(0, 4).map((l) => l.replace(/^[-*•]\s*/, "")),
    });
  }

  // 7. Parse Education Entries
  const education: EducationItem[] = [];
  const eduLines = sections.education;
  if (eduLines.length > 0) {
    education.push({
      id: `edu-${Date.now()}`,
      institution: eduLines[0] || "University",
      degree: eduLines[1]?.match(/bachelor|master|b\.s\.|m\.s\.|phd|associate/i) ? eduLines[1] : "Bachelor of Science",
      fieldOfStudy: eduLines[1] || "Computer Science",
      location: location || "",
      startDate: "2018",
      endDate: "2022",
      highlights: eduLines.slice(2, 4),
    });
  }

  // 8. Parse Projects
  const projects: ProjectItem[] = [];
  const projLines = sections.projects;
  if (projLines.length > 0) {
    projects.push({
      id: `proj-${Date.now()}`,
      title: projLines[0] || "Featured Project",
      description: projLines.slice(1, 3).join(" "),
      bullets: projLines.slice(3, 6).map((l) => l.replace(/^[-*•]\s*/, "")),
      techStack: skillTokens.slice(0, 4),
    });
  }

  // Calculate completeness score
  const extractedSections: string[] = [];
  let score = 20; // base
  if (email && phone) {
    score += 15;
    extractedSections.push("Contact Details");
  }
  if (summary) {
    score += 15;
    extractedSections.push("Professional Summary");
  }
  if (experience.length > 0) {
    score += 25;
    extractedSections.push("Work Experience");
  }
  if (education.length > 0) {
    score += 10;
    extractedSections.push("Education");
  }
  if (skills[0].items.length > 0) {
    score += 15;
    extractedSections.push("Skills");
  }

  return {
    personalInfo: {
      fullName,
      email,
      phone,
      location,
      jobTitle,
      linkedin,
      github,
    },
    summary,
    experience,
    education,
    skills,
    projects,
    certifications: [],
    rawText,
    completenessScore: Math.min(100, score),
    extractedSections,
  };
}
