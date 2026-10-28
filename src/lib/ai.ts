import { ResumeData, AtsScanResult } from "./types";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

async function callGeminiApi(prompt: string, customApiKey?: string | null): Promise<string | null> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Try gemini-2.5-flash first, then fallback to gemini-1.5-flash
  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        console.warn(`Gemini API ${model} returned status ${response.status}`);
        continue;
      }

      const data: GeminiResponse = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err) {
      console.warn(`Error calling Gemini model ${model}:`, err);
    }
  }

  return null;
}

// ----------------------------------------------------
// 1. Professional Summary Generator
// ----------------------------------------------------
export async function generateProfessionalSummary({
  targetRole,
  experienceYears,
  keySkills,
  currentSummary,
  apiKey,
}: {
  targetRole: string;
  experienceYears?: string;
  keySkills: string[];
  currentSummary?: string;
  apiKey?: string | null;
}): Promise<{ summary: string; engine: "gemini" | "heuristic" }> {
  const prompt = `You are an elite executive career coach and resume writer.
Generate a compelling, ATS-optimized 3-sentence professional summary for a candidate targeting the role: "${targetRole}".
Key skills: ${keySkills.join(", ")}
${experienceYears ? `Experience level: ${experienceYears}` : ""}
${currentSummary ? `Existing draft to refine: "${currentSummary}"` : ""}

Rules:
1. Do not invent fake employers or fake degrees.
2. Highlight measurable impact, technical leadership, and strategic execution.
3. Tone: confident, professional, concise.
4. Output ONLY the raw paragraph of text, no markdown headers or quotes.`;

  const geminiResult = await callGeminiApi(prompt, apiKey);
  if (geminiResult) {
    return { summary: geminiResult.replace(/^["']|["']$/g, ""), engine: "gemini" };
  }

  // Heuristic generation fallback
  const skillsSnippet = keySkills.slice(0, 4).join(", ");
  const fallbackSummary = `Results-driven ${targetRole || "Professional"} with proven expertise across ${skillsSnippet || "strategic execution, project delivery, and cross-functional leadership"}. Track record of architecting scalable solutions, optimizing operational workflows, and delivering high-impact initiatives on schedule and within budget. Recognized for bridging technical complexity with business goals to drive measurable productivity gains and team performance.`;

  return { summary: fallbackSummary, engine: "heuristic" };
}

// ----------------------------------------------------
// 2. Bullet Point Improver (Action Verbs + Metrics)
// ----------------------------------------------------
export async function improveBulletPoint({
  bullet,
  role,
  company,
  apiKey,
}: {
  bullet: string;
  role?: string;
  company?: string;
  apiKey?: string | null;
}): Promise<{ improved: string; suggestions: string[]; engine: "gemini" | "heuristic" }> {
  const prompt = `You are a professional resume bullet-point optimizer.
Transform this weak resume bullet into a high-impact, ATS-optimized accomplishment using the Google XYZ formula ("Accomplished [X], measured by [Y], by doing [Z]").
Target Role: ${role || "Professional"}
Company Context: ${company || "General"}
Current Bullet: "${bullet}"

Requirements:
- Begin with a strong action verb (e.g., Spearheaded, Orchestrated, Engineered, Accelerated, Streamlined).
- Include realistic quantification placeholders or metrics if absent (e.g. "by 35%", "saving 12 hours/week").
- Never fabricate false company names or fake credentials.
- Respond with a JSON object format:
{
  "improved": "Primary best version",
  "alternatives": ["Alternative 1 with focus on metrics", "Alternative 2 with focus on leadership"]
}`;

  const geminiResult = await callGeminiApi(prompt, apiKey);
  if (geminiResult) {
    try {
      const cleaned = geminiResult.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.improved) {
        return {
          improved: parsed.improved,
          suggestions: parsed.alternatives || [],
          engine: "gemini",
        };
      }
    } catch {
      // Fallback if parsing fails
      return { improved: geminiResult.split("\n")[0].replace(/^[-*•]\s*/, ""), suggestions: [], engine: "gemini" };
    }
  }

  // Heuristic rule-based transformer
  const cleanBullet = bullet.trim().replace(/^[-*•]\s*/, "");
  const verbs = ["Spearheaded", "Engineered", "Orchestrated", "Accelerated", "Optimized", "Architected"];
  const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];

  let refined = cleanBullet;
  if (/^(worked on|helped with|responsible for|did|handled|managed)/i.test(cleanBullet)) {
    refined = cleanBullet.replace(/^(worked on|helped with|responsible for|did|handled|managed)\s*/i, `${randomVerb} `);
  } else if (!/^[A-Z][a-z]+ed\b/.test(cleanBullet)) {
    refined = `${randomVerb} ${cleanBullet.charAt(0).toLowerCase() + cleanBullet.slice(1)}`;
  }

  if (!/\d+%|\$|\d+x|\d+\s*(users|clients|team|members|hours|days)/i.test(refined)) {
    refined += ", resulting in a 25% improvement in workflow efficiency and delivery velocity";
  }

  const suggestions = [
    `Streamlined ${cleanBullet.toLowerCase()}, cutting cycle time by 30% through automated verification.`,
    `Led the deployment of ${cleanBullet.toLowerCase()}, improving operational scalability across cross-functional teams.`,
  ];

  return {
    improved: refined,
    suggestions,
    engine: "heuristic",
  };
}

// ----------------------------------------------------
// 3. Skills Suggester
// ----------------------------------------------------
export async function suggestSkillsForRole({
  targetRole,
  existingSkills = [],
  apiKey,
}: {
  targetRole: string;
  existingSkills?: string[];
  apiKey?: string | null;
}): Promise<{ suggested: string[]; categories: Record<string, string[]>; engine: "gemini" | "heuristic" }> {
  const prompt = `Given the target job role "${targetRole}", suggest relevant, in-demand technical and domain skills.
Already included skills to avoid duplicating: ${existingSkills.join(", ")}

Respond with JSON:
{
  "categories": {
    "Technical & Tools": ["skill1", "skill2"],
    "Frameworks & Methodologies": ["skill3", "skill4"],
    "Core Competencies": ["skill5", "skill6"]
  }
}`;

  const geminiResult = await callGeminiApi(prompt, apiKey);
  if (geminiResult) {
    try {
      const cleaned = geminiResult.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.categories) {
        const all = Object.values(parsed.categories).flat() as string[];
        return {
          suggested: all.filter((s) => !existingSkills.map((e) => e.toLowerCase()).includes(s.toLowerCase())),
          categories: parsed.categories,
          engine: "gemini",
        };
      }
    } catch {
      // Fallback
    }
  }

  // Heuristic skills dictionary
  const roleLower = targetRole.toLowerCase();
  let defaultCategories: Record<string, string[]> = {
    "Technical & Tools": ["Git", "Docker", "REST APIs", "CI/CD", "PostgreSQL", "Linux"],
    "Frameworks & Platforms": ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS"],
    "Core Competencies": ["Agile / Scrum", "System Architecture", "Performance Optimization", "Code Review"],
  };

  if (roleLower.includes("data") || roleLower.includes("machine learning") || roleLower.includes("ai")) {
    defaultCategories = {
      "Languages & ML": ["Python", "SQL", "PyTorch", "TensorFlow", "Pandas", "NumPy"],
      "Data Infrastructure": ["BigQuery", "Snowflake", "Apache Spark", "Airflow", "Kafka"],
      "Analytics & Modeling": ["Statistical Modeling", "Feature Engineering", "A/B Testing", "Data Pipeline ETL"],
    };
  } else if (roleLower.includes("product") || roleLower.includes("manager")) {
    defaultCategories = {
      "Product Strategy": ["Roadmap Planning", "User Research", "Go-To-Market (GTM)", "A/B Testing"],
      "Analytics & Metrics": ["SQL", "Google Analytics", "Mixpanel", "Jira", "KPI Tracking"],
      "Leadership": ["Stakeholder Management", "Cross-Functional Collaboration", "Agile / Scrum", "Sprint Planning"],
    };
  } else if (roleLower.includes("design") || roleLower.includes("ui") || roleLower.includes("ux")) {
    defaultCategories = {
      "Design Tools": ["Figma", "Design Systems", "Prototyping", "Adobe Creative Suite"],
      "UX Methodologies": ["User Journeys", "Wireframing", "Usability Testing", "Information Architecture"],
      "Frontend Literacy": ["HTML5/CSS3", "Responsive Design", "Accessibility (WCAG)", "Design Tokens"],
    };
  }

  const all = Object.values(defaultCategories).flat();
  const filtered = all.filter((s) => !existingSkills.map((e) => e.toLowerCase()).includes(s.toLowerCase()));

  return {
    suggested: filtered,
    categories: defaultCategories,
    engine: "heuristic",
  };
}

// ----------------------------------------------------
// 4. ATS Match Analyzer & Resume Tailoring
// ----------------------------------------------------
export async function tailorResumeToJob({
  resume,
  jobTitle,
  company,
  jobDescription,
  apiKey,
}: {
  resume: ResumeData;
  jobTitle: string;
  company: string;
  jobDescription: string;
  apiKey?: string | null;
}): Promise<{ result: AtsScanResult; engine: "gemini" | "heuristic" }> {
  const resumeText = [
    resume.summary,
    resume.experience.map((e) => `${e.role} at ${e.company}: ${e.bullets.join(" ")}`).join("\n"),
    resume.skills.map((s) => `${s.category}: ${s.items.join(", ")}`).join("\n"),
    resume.projects.map((p) => `${p.title}: ${p.description} ${p.bullets.join(" ")}`).join("\n"),
  ].join("\n");

  const prompt = `You are a certified ATS (Applicant Tracking System) algorithm analyst and executive resume writer.
Analyze this resume against the provided Job Description.

Job Title: ${jobTitle}
Company: ${company}
Job Description:
${jobDescription}

Resume Content:
${resumeText}

Tasks:
1. Extract the top 10-15 essential technical keywords and domain competencies from the job description.
2. Determine which of these keywords are present in the candidate's resume (matchingKeywords).
3. Determine which essential keywords are missing (missingKeywords).
4. Calculate a realistic ATS Match Score (0 to 100).
5. Provide 3-5 specific, actionable recommendations to improve the match.
6. Generate an ATS-tailored professional summary emphasizing common overlaps without lying.
7. For up to 3 of the candidate's existing experience bullet points, rewrite them to naturally highlight relevant keywords from the job description.

Output MUST be strictly valid JSON:
{
  "matchScore": 76,
  "matchingKeywords": ["React", "TypeScript", "REST APIs"],
  "missingKeywords": ["GraphQL", "CI/CD Pipelines", "Kubernetes"],
  "recommendations": ["Incorporate your experience with GraphQL in the projects section", "Add metrics to leadership bullets"],
  "tailoredSummary": "High-impact summary...",
  "tailoredBullets": {
    "exp-1": ["Rewritten bullet 1"]
  }
}`;

  const geminiResult = await callGeminiApi(prompt, apiKey);
  if (geminiResult) {
    try {
      const cleaned = geminiResult.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (typeof parsed.matchScore === "number") {
        return {
          result: {
            matchScore: Math.min(100, Math.max(10, parsed.matchScore)),
            matchingKeywords: parsed.matchingKeywords || [],
            missingKeywords: parsed.missingKeywords || [],
            recommendations: parsed.recommendations || [],
            tailoredSummary: parsed.tailoredSummary || "",
            tailoredBullets: parsed.tailoredBullets || {},
          },
          engine: "gemini",
        };
      }
    } catch {
      // Fallback to heuristic
    }
  }

  // Heuristic ATS Analysis
  // Tokenize job description for technical and professional buzzwords
  const commonTechWords = [
    "TypeScript", "JavaScript", "Python", "React", "Next.js", "Node.js", "Docker", "Kubernetes",
    "AWS", "GCP", "Azure", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST", "CI/CD",
    "Microservices", "System Design", "Agile", "Scrum", "Git", "Testing", "Jest", "Tailwind",
    "Security", "Leadership", "Analytics", "Architecture", "Scalability", "Collaboration"
  ];

  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const jdKeywords: string[] = [];
  for (const word of commonTechWords) {
    if (jdLower.includes(word.toLowerCase())) {
      jdKeywords.push(word);
    }
  }

  // Add words found with regex (e.g. capitalized terms)
  const regexTerms = jobDescription.match(/\b[A-Z][a-zA-Z0-9+#.]{2,}\b/g) || [];
  for (const term of regexTerms.slice(0, 20)) {
    if (!["The", "And", "With", "For", "You", "Our", "Will", "Have", "Job", "Role"].includes(term) && !jdKeywords.includes(term)) {
      jdKeywords.push(term);
    }
  }

  const matching: string[] = [];
  const missing: string[] = [];

  for (const kw of jdKeywords.slice(0, 15)) {
    if (resumeLower.includes(kw.toLowerCase())) {
      matching.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const total = matching.length + missing.length || 10;
  const matchScore = Math.min(95, Math.max(35, Math.round((matching.length / total) * 100)));

  const recommendations = [
    missing.length > 0
      ? `Explicitly integrate missing keywords: ${missing.slice(0, 3).join(", ")} where applicable in your experience bullets.`
      : "Ensure your project section highlights technologies aligned with the job description.",
    "Quantify your accomplishments with concrete figures (e.g., latency reduction, cost savings, user growth).",
    `Tailor your professional summary to directly address the requirements for ${jobTitle} at ${company}.`,
  ];

  const tailoredSummary = `Accomplished ${jobTitle || resume.personalInfo.jobTitle || "Engineer"} with demonstrated background delivering robust solutions. Experienced in ${matching.slice(0, 4).join(", ") || "software engineering and system design"}, with a focus on building resilient systems and accelerating team velocity. Eager to contribute to ${company}'s ongoing innovation and technical milestones.`;

  return {
    result: {
      matchScore,
      matchingKeywords: matching,
      missingKeywords: missing,
      recommendations,
      tailoredSummary,
      tailoredBullets: {},
    },
    engine: "heuristic",
  };
}

// ----------------------------------------------------
// 5. Cover Letter Generator
// ----------------------------------------------------
export async function generateCoverLetter({
  resume,
  jobTitle,
  company,
  jobDescription,
  tone = "professional",
  apiKey,
}: {
  resume: ResumeData;
  jobTitle: string;
  company: string;
  jobDescription?: string;
  tone?: "professional" | "conversational" | "executive" | "bold";
  apiKey?: string | null;
}): Promise<{ content: string; engine: "gemini" | "heuristic" }> {
  const applicantName = resume.personalInfo.fullName || "Candidate";
  const applicantEmail = resume.personalInfo.email || "email@example.com";
  const applicantPhone = resume.personalInfo.phone || "";

  const prompt = `You are an expert career consultant.
Write a targeted, high-converting cover letter for:
Applicant: ${applicantName}
Role: ${jobTitle}
Company: ${company}
Tone: ${tone}

Candidate Background:
Summary: ${resume.summary}
Top Experience: ${resume.experience.slice(0, 2).map((e) => `${e.role} at ${e.company} (${e.bullets.slice(0, 2).join("; ")})`).join("\n")}
Top Skills: ${resume.skills.flatMap((s) => s.items).slice(0, 8).join(", ")}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}

Rules:
- 3 to 4 cohesive paragraphs.
- Do NOT invent fake previous employers or qualifications not in the background.
- Connect the candidate's actual projects and skills to the company's presumed needs.
- Include formal header block and sign-off.`;

  const geminiResult = await callGeminiApi(prompt, apiKey);
  if (geminiResult) {
    return { content: geminiResult, engine: "gemini" };
  }

  // Heuristic Cover Letter template
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const topExp = resume.experience[0];
  const skillHighlight = resume.skills[0]?.items?.slice(0, 3).join(", ") || "engineering, design, and strategic execution";

  const fallbackLetter = `${applicantName}
${applicantEmail} | ${applicantPhone}
${today}

Hiring Team
${company}

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${company}. Having followed ${company}'s trajectory and standard of excellence, I am confident that my background in ${skillHighlight} aligns seamlessly with the goals of your team.

${topExp ? `In my role as ${topExp.role} at ${topExp.company}, I spearheaded initiatives that directly improved team outcomes and operational efficiency. For instance, I ${topExp.bullets[0] ? topExp.bullets[0].toLowerCase().replace(/^[-*•]\s*/, "") : "led key technical milestones that accelerated delivery timelines"}. This experience taught me how to deliver high-quality work in fast-paced environments while keeping end-user impact at the forefront.` : `Throughout my career, I have prioritized solving complex problems through disciplined execution and cross-functional collaboration.`}

What excites me most about joining ${company} is the opportunity to apply my expertise in ${resume.personalInfo.jobTitle || jobTitle} to drive impactful, scalable solutions. I am eager to bring my collaborative mindset and passion for continuous improvement to your organization.

Thank you for your time and consideration. I welcome the opportunity to discuss how my experience and perspective can support ${company}'s upcoming milestones.

Sincerely,

${applicantName}`;

  return { content: fallbackLetter, engine: "heuristic" };
}
