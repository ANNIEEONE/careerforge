import fs from "fs";
import path from "path";
import { ResumeData, UserSession } from "./types";
import { getDefaultResumeData } from "./defaults";

const TMP_STORE_PATH = path.join(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.platform === "linux"
    ? "/tmp"
    : process.cwd(),
  "careerforge-state.json"
);

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  role: string;
  plan: "FREE" | "PRO";
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  onboardingCompleted: boolean;
  geminiApiKey?: string | null;
}

export interface StoredPortfolio {
  id: string;
  userId: string;
  resumeId: string | null;
  slug: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  theme: string;
  accentColor: string;
  sectionsConfig: Record<string, boolean>;
  customLinks: Array<{ label: string; url: string; icon?: string }>;
  isPublished: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface StateSchema {
  users: Record<string, StoredUser>;
  resumes: Record<string, ResumeData>;
  portfolios: Record<string, StoredPortfolio>;
}

// Initial seed data
function getInitialState(): StateSchema {
  const demoUserId = "demo-user-1";
  const alexRivera: StoredUser = {
    id: demoUserId,
    email: "alex.rivera@example.com",
    name: "Alex Rivera",
    role: "USER",
    plan: "PRO",
    aiCreditsUsed: 42,
    aiCreditsLimit: 100,
    onboardingCompleted: true,
  };

  const demoUser2: StoredUser = {
    id: "demo-user-2",
    email: "demo@careerforge.io",
    name: "Demo Professional",
    role: "USER",
    plan: "PRO",
    aiCreditsUsed: 5,
    aiCreditsLimit: 100,
    onboardingCompleted: true,
  };

  const defaultData1 = getDefaultResumeData(demoUserId, {
    title: "Senior Staff Distributed Systems Engineer Resume",
    targetRole: "Senior Staff Distributed Systems Engineer",
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
  });

  const resume1: ResumeData = {
    ...defaultData1,
    id: "demo-resume-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    templateId: "swiss-sidebar",
    isPublic: true,
    shareSlug: "alex-rivera-systems",
    lastAtsScore: 94,
    typography: {
      font: "inter",
      fontSize: "normal",
      accentColor: "#1e3a8a",
      lineHeight: "normal",
    },
    layoutConfig: {
      paperFormat: "a4",
      margins: "normal",
      showIcons: true,
    },
  };

  const defaultData2 = getDefaultResumeData(demoUserId, {
    title: "Lead Full-Stack Developer Resume",
    targetRole: "Lead Full-Stack Engineer",
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
  });

  const resume2: ResumeData = {
    ...defaultData2,
    id: "demo-resume-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    templateId: "editorial-luxury",
    isPublic: false,
    shareSlug: undefined,
    lastAtsScore: 88,
    typography: {
      font: "serif",
      fontSize: "normal",
      accentColor: "#991b1b",
      lineHeight: "relaxed",
    },
    layoutConfig: {
      paperFormat: "a4",
      margins: "normal",
      showIcons: true,
    },
  };

  const portfolio1: StoredPortfolio = {
    id: "demo-port-1",
    userId: demoUserId,
    resumeId: "demo-resume-1",
    slug: "alex-rivera",
    title: "Alex Rivera — Portfolio",
    tagline: "Building resilient distributed systems & real-time settlement rails",
    bio: "Staff Distributed Systems & Infrastructure Engineer with 9+ years experience architecting high-throughput distributed applications across AWS and GCP.",
    theme: "tech-dark",
    accentColor: "#2563eb",
    sectionsConfig: {
      showAbout: true,
      showExperience: true,
      showProjects: true,
      showSkills: true,
      showEducation: true,
      showContact: true,
    },
    customLinks: [
      { label: "GitHub", url: "https://github.com/alexrivera-eng", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/alex-rivera-systems", icon: "linkedin" },
    ],
    isPublished: true,
    viewsCount: 142,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    users: {
      [alexRivera.id]: alexRivera,
      [alexRivera.email]: alexRivera,
      [demoUser2.id]: demoUser2,
      [demoUser2.email]: demoUser2,
    },
    resumes: {
      [resume1.id]: resume1,
      [resume2.id]: resume2,
    },
    portfolios: {
      [portfolio1.id]: portfolio1,
      [portfolio1.slug]: portfolio1,
    },
  };
}

let inMemoryState: StateSchema | null = null;

function loadState(): StateSchema {
  if (inMemoryState) return inMemoryState;

  try {
    if (fs.existsSync(TMP_STORE_PATH)) {
      const data = fs.readFileSync(TMP_STORE_PATH, "utf-8");
      inMemoryState = JSON.parse(data);
      return inMemoryState!;
    }
  } catch (err) {
    console.warn("Could not read temporary store file, using initial state:", err);
  }

  inMemoryState = getInitialState();
  saveState();
  return inMemoryState;
}

function saveState() {
  if (!inMemoryState) return;
  try {
    const serialized = JSON.stringify(inMemoryState, null, 2);
    fs.writeFileSync(TMP_STORE_PATH, serialized, "utf-8");
  } catch (err) {
    // If /tmp is not writable or error occurs, in-memory state remains valid
    console.warn("Could not save to temporary store file:", err);
  }
}

export const serverStore = {
  getUserByEmail(email: string): StoredUser | null {
    const state = loadState();
    const normalized = email.toLowerCase().trim();
    return state.users[normalized] || null;
  },

  getUserById(id: string): StoredUser | null {
    const state = loadState();
    return state.users[id] || null;
  },

  createUser(user: StoredUser): StoredUser {
    const state = loadState();
    const normalized = user.email.toLowerCase().trim();
    state.users[user.id] = user;
    state.users[normalized] = user;
    saveState();
    return user;
  },

  updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const state = loadState();
    const user = state.users[id];
    if (!user) return null;
    const updated = { ...user, ...updates };
    state.users[id] = updated;
    state.users[updated.email.toLowerCase().trim()] = updated;
    saveState();
    return updated;
  },

  getResumesByUserId(userId: string): ResumeData[] {
    const state = loadState();
    return Object.values(state.resumes).filter((r) => r.userId === userId || userId === "demo-user-1");
  },

  getResumeById(id: string): ResumeData | null {
    const state = loadState();
    return state.resumes[id] || null;
  },

  createResume(userId: string, data: Partial<ResumeData>): ResumeData {
    const state = loadState();
    const user = state.users[userId];
    const defaultData = getDefaultResumeData(userId, {
      title: data.title,
      targetRole: data.targetRole,
      fullName: user?.name || "Professional",
      email: user?.email || "user@example.com",
    });

    const newResume: ResumeData = {
      ...defaultData,
      id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    state.resumes[newResume.id] = newResume;
    saveState();
    return newResume;
  },

  updateResume(id: string, updates: Partial<ResumeData>): ResumeData | null {
    const state = loadState();
    let resume = state.resumes[id];
    if (!resume) {
      // If updating a demo resume or new resume that wasn't in state, initialize it
      const defaultData = getDefaultResumeData("demo-user-1");
      resume = {
        ...defaultData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const updated: ResumeData = {
      ...resume,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    state.resumes[id] = updated;
    saveState();
    return updated;
  },

  deleteResume(id: string): boolean {
    const state = loadState();
    if (state.resumes[id]) {
      delete state.resumes[id];
      saveState();
      return true;
    }
    return false;
  },

  duplicateResume(id: string, userId: string): ResumeData | null {
    const original = this.getResumeById(id);
    if (!original) return null;
    const duplicated: ResumeData = {
      ...original,
      id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: `${original.title} (Copy)`,
      shareSlug: `${original.shareSlug || "resume"}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const state = loadState();
    state.resumes[duplicated.id] = duplicated;
    saveState();
    return duplicated;
  },

  getPortfoliosByUserId(userId: string): StoredPortfolio[] {
    const state = loadState();
    return Object.values(state.portfolios).filter(
      (p) => p.userId === userId || userId === "demo-user-1"
    );
  },

  getPortfolioById(id: string): StoredPortfolio | null {
    const state = loadState();
    return state.portfolios[id] || null;
  },

  getPortfolioBySlug(slug: string): StoredPortfolio | null {
    const state = loadState();
    return (
      Object.values(state.portfolios).find((p) => p.slug === slug && p.isPublished) ||
      state.portfolios["demo-port-1"] ||
      null
    );
  },

  createPortfolio(userId: string, data: Partial<StoredPortfolio>): StoredPortfolio {
    const state = loadState();
    const user = state.users[userId];
    const baseSlug = (data.slug || user?.name || "portfolio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newPort: StoredPortfolio = {
      id: `port-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      resumeId: data.resumeId || "demo-resume-1",
      slug: baseSlug,
      title: data.title || `${user?.name || "Professional"}'s Portfolio`,
      tagline: data.tagline || "Software Engineer & Builder",
      bio: data.bio || "Welcome to my personal portfolio website.",
      theme: data.theme || "tech-dark",
      accentColor: data.accentColor || "#2563eb",
      sectionsConfig: data.sectionsConfig || {
        showAbout: true,
        showExperience: true,
        showProjects: true,
        showSkills: true,
        showEducation: true,
        showContact: true,
      },
      customLinks: data.customLinks || [
        { label: "GitHub", url: "https://github.com", icon: "github" },
      ],
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.portfolios[newPort.id] = newPort;
    saveState();
    return newPort;
  },

  updatePortfolio(id: string, updates: Partial<StoredPortfolio>): StoredPortfolio | null {
    const state = loadState();
    let port = state.portfolios[id];
    if (!port) {
      port = {
        id,
        userId: "demo-user-1",
        resumeId: "demo-resume-1",
        slug: "alex-rivera",
        title: "Alex Rivera — Portfolio",
        tagline: "Software Engineer",
        bio: "",
        theme: "tech-dark",
        accentColor: "#2563eb",
        sectionsConfig: {
          showAbout: true,
          showExperience: true,
          showProjects: true,
          showSkills: true,
          showEducation: true,
          showContact: true,
        },
        customLinks: [],
        isPublished: true,
        viewsCount: 142,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const updated = { ...port, ...updates, updatedAt: new Date().toISOString() };
    state.portfolios[id] = updated;
    saveState();
    return updated;
  },

  deletePortfolio(id: string): boolean {
    const state = loadState();
    if (state.portfolios[id]) {
      delete state.portfolios[id];
      saveState();
      return true;
    }
    return false;
  },
};
