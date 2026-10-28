export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  website?: string;
  linkedin?: string;
  github?: string;
  avatarUrl?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights?: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  link?: string;
  github?: string;
  description: string;
  bullets: string[];
  techStack: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  url?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Native" | "Fluent" | "Proficient" | "Intermediate" | "Basic";
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  bullets?: string[];
}

export interface CustomSection {
  id: string;
  heading: string;
  items: CustomSectionItem[];
}

export type TemplateId = "modern" | "minimal" | "executive" | "technical" | "creative";

export interface TypographyConfig {
  font: "inter" | "serif" | "mono" | "system";
  fontSize: "compact" | "normal" | "spacious";
  accentColor: string;
  lineHeight: "compact" | "normal" | "relaxed";
}

export interface LayoutConfig {
  paperFormat: "a4" | "letter";
  margins: "compact" | "normal" | "spacious";
  showIcons: boolean;
  twoColumn?: boolean;
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  targetRole?: string;
  targetCompany?: string;
  summary: string;
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: LanguageItem[];
  customSections: CustomSection[];
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  templateId: TemplateId;
  typography: TypographyConfig;
  layoutConfig: LayoutConfig;
  isPublic: boolean;
  shareSlug?: string;
  lastAtsScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AtsScanResult {
  matchScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
  tailoredSummary?: string;
  tailoredBullets?: Record<string, string[]>;
}

export interface PortfolioData {
  id: string;
  userId: string;
  resumeId?: string;
  slug: string;
  title: string;
  tagline?: string;
  bio?: string;
  theme: "editorial" | "tech-dark" | "minimal-slate" | "creative-warm";
  accentColor: string;
  sectionsConfig: {
    showAbout: boolean;
    showExperience: boolean;
    showProjects: boolean;
    showSkills: boolean;
    showEducation: boolean;
    showContact: boolean;
  };
  customLinks: { label: string; url: string; icon?: string }[];
  customDomain?: string;
  isPublished: boolean;
  viewsCount: number;
  resume?: Partial<ResumeData>;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: "FREE" | "PRO";
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  onboardingCompleted: boolean;
  hasCustomKey: boolean;
}
