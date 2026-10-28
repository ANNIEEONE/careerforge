import { ResumeData } from "./types";

export function getDefaultResumeData(
  userId: string,
  overrides?: {
    title?: string;
    targetRole?: string;
    fullName?: string;
    email?: string;
  }
): Omit<ResumeData, "id" | "createdAt" | "updatedAt"> {
  const role = overrides?.targetRole || "Senior Full-Stack Engineer";
  const name = overrides?.fullName || "Alex Rivera";
  const email = overrides?.email || "alex.rivera@example.com";

  return {
    userId,
    title: overrides?.title || `${role} Resume`,
    targetRole: role,
    targetCompany: "Tech Innovations Inc.",
    summary: `Results-driven ${role} with 5+ years of experience architecting distributed cloud applications and high-throughput web systems. Proven track record of spearheading microservices migrations, reducing infrastructure latency by 42%, and mentoring high-velocity engineering teams. Passionate about clean system architecture, developer velocity, and test-driven reliability.`,
    personalInfo: {
      fullName: name,
      email: email,
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      jobTitle: role,
      website: "https://alexrivera.dev",
      linkedin: "linkedin.com/in/alexrivera-eng",
      github: "github.com/alexrivera",
    },
    experience: [
      {
        id: "exp-1",
        company: "Vanguard Cloud Systems",
        role: "Lead Software Engineer",
        location: "San Francisco, CA",
        startDate: "2022",
        endDate: "Present",
        current: true,
        bullets: [
          "Spearheaded redesign of core data ingestion pipeline using TypeScript and Go, decreasing end-to-end processing latency by 38% for 4.2M daily active records.",
          "Orchestrated migration of legacy monolith into containerized Kubernetes microservices, achieving 99.98% service uptime and cutting cloud infrastructure expenses by $85K annually.",
          "Instituted comprehensive automated CI/CD validation gates and automated test suites, expanding unit and integration coverage from 52% to 91%.",
          "Mentored 6 junior and mid-level engineers through bi-weekly architectural reviews and structured pair-programming sessions.",
        ],
      },
      {
        id: "exp-2",
        company: "Nexus Digital Labs",
        role: "Full-Stack Software Engineer",
        location: "Austin, TX",
        startDate: "2019",
        endDate: "2022",
        current: false,
        bullets: [
          "Architected customer-facing analytics dashboard using Next.js, React, and Tailwind CSS, increasing enterprise client engagement metrics by 27%.",
          "Engineered distributed caching layer with Redis and PostgreSQL connection pooling, resolving peak-load database bottlenecks during global product rollouts.",
          "Collaborated closely with Product Management and UI/UX teams to iterate rapidly on user feedback, shipping 14 major feature releases ahead of schedule.",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        location: "Berkeley, CA",
        startDate: "2015",
        endDate: "2019",
        gpa: "3.84 / 4.0",
        highlights: [
          "Dean's Honor List for 6 consecutive academic terms",
          "Undergraduate Researcher in Distributed Systems Lab",
        ],
      },
    ],
    skills: [
      {
        category: "Languages & Frameworks",
        items: ["TypeScript", "JavaScript", "Python", "Go", "React", "Next.js", "Node.js", "Tailwind CSS"],
      },
      {
        category: "Databases & Cloud",
        items: ["PostgreSQL", "Redis", "SQLite", "Prisma", "Docker", "Kubernetes", "AWS (ECS, S3, RDS)", "CI/CD"],
      },
      {
        category: "Architecture & Practices",
        items: ["RESTful APIs", "GraphQL", "Microservices", "System Design", "Agile / Scrum", "TDD & Unit Testing"],
      },
    ],
    projects: [
      {
        id: "proj-1",
        title: "OmniMetrics Analytics Platform",
        role: "Creator & Lead Developer",
        link: "https://github.com/alexrivera/omni-metrics",
        github: "https://github.com/alexrivera/omni-metrics",
        description: "Open-source real-time event ingestion and visualization dashboard processing 50k websocket events per second.",
        bullets: [
          "Implemented lightweight client-side telemetry SDK with zero external runtime dependencies.",
          "Ranked in GitHub Trending with 1,200+ stars and utilized in production by 8 early-stage startups.",
        ],
        techStack: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Tailwind CSS"],
      },
      {
        id: "proj-2",
        title: "DevForge Automation CLI",
        role: "Author",
        link: "https://github.com/alexrivera/devforge",
        github: "https://github.com/alexrivera/devforge",
        description: "High-speed developer workstation configuration CLI written in Go for rapid project bootstrapping.",
        bullets: [
          "Reduced new developer machine provisioning time from 4 hours to under 8 minutes across 35 team members.",
        ],
        techStack: ["Go", "Docker", "Bash", "GitHub Actions"],
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        issueDate: "2023",
      },
      {
        id: "cert-2",
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Linux Foundation / CNCF",
        issueDate: "2024",
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "1st Place - Silicon Valley Hackathon 2023",
        description: "Built an accessible voice-driven developer productivity tool selected out of 140 competing teams.",
        date: "2023",
      },
    ],
    languages: [
      { id: "lang-1", language: "English", proficiency: "Native" },
      { id: "lang-2", language: "Spanish", proficiency: "Fluent" },
    ],
    customSections: [],
    sectionOrder: [
      "summary",
      "experience",
      "skills",
      "projects",
      "education",
      "certifications",
      "achievements",
      "languages",
      "customSections",
    ],
    sectionVisibility: {
      summary: true,
      experience: true,
      skills: true,
      projects: true,
      education: true,
      certifications: true,
      achievements: true,
      languages: true,
      customSections: true,
    },
    templateId: "modern",
    typography: {
      font: "inter",
      fontSize: "normal",
      accentColor: "#2563eb",
      lineHeight: "normal",
    },
    layoutConfig: {
      paperFormat: "a4",
      margins: "normal",
      showIcons: true,
    },
    isPublic: false,
    shareSlug: `alex-${Math.random().toString(36).substring(2, 8)}`,
    lastAtsScore: 88,
  };
}
