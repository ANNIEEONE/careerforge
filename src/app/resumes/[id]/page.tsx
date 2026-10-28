"use client";

import { useEffect, useState, useTransition, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Download,
  Share2,
  History,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Palette,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Award,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileDown,
  AlertCircle,
} from "lucide-react";
import ResumePreview from "@/components/ResumePreview";
import AtsScoreModal from "@/components/AtsScoreModal";
import VersionHistoryModal from "@/components/VersionHistoryModal";
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
  TemplateId,
} from "@/lib/types";
import { RESUME_TEMPLATES, ACCENT_COLORS } from "@/lib/templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ResumeEditorContent({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("Just now");
  const [error, setError] = useState<string | null>(null);

  // Active section tab in editor
  const [activeTab, setActiveTab] = useState<
    "personal" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "design"
  >("personal");

  // Zoom level for preview canvas
  const [zoom, setZoom] = useState<number>(0.85);

  // Modals state
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI loading indicators
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiBulletLoadingId, setAiBulletLoadingId] = useState<string | null>(null);
  const [aiSkillLoading, setAiSkillLoading] = useState(false);

  // Fetch initial resume data
  const loadResume = useCallback(async () => {
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/auth/login");
        throw new Error("Failed to load resume.");
      }
      const data = await res.json();
      setResume(data.resume);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  // Autosave function with debounce
  const saveResumeChanges = async (updated: ResumeData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save changes.");
      }

      setLastSaved("Just now");
    } catch (err: unknown) {
      console.error("Autosave error:", err);
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Helper to update resume state and trigger autosave
  const updateResume = (updater: (prev: ResumeData) => ResumeData) => {
    if (!resume) return;
    const next = updater(resume);
    setResume(next);
    saveResumeChanges(next);
  };

  // ----------------------------------------------------
  // AI Handlers
  // ----------------------------------------------------
  const handleGenerateSummary = async () => {
    if (!resume) return;
    setAiSummaryLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: resume.targetRole || resume.personalInfo.jobTitle,
          keySkills: resume.skills.flatMap((s) => s.items).slice(0, 6),
          currentSummary: resume.summary,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary.");

      updateResume((prev) => ({
        ...prev,
        summary: data.summary,
      }));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleImproveBullet = async (expId: string, bulletIndex: number, currentBullet: string) => {
    if (!currentBullet.trim()) return;
    const bulletKey = `${expId}-${bulletIndex}`;
    setAiBulletLoadingId(bulletKey);
    setError(null);

    try {
      const expItem = resume?.experience.find((e) => e.id === expId);
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet: currentBullet,
          role: expItem?.role,
          company: expItem?.company,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to improve bullet.");

      updateResume((prev) => ({
        ...prev,
        experience: prev.experience.map((e) => {
          if (e.id !== expId) return e;
          const nextBullets = [...e.bullets];
          nextBullets[bulletIndex] = data.improved;
          return { ...e, bullets: nextBullets };
        }),
      }));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setAiBulletLoadingId(null);
    }
  };

  const handleSuggestSkills = async () => {
    if (!resume) return;
    setAiSkillLoading(true);
    setError(null);

    try {
      const existing = resume.skills.flatMap((s) => s.items);
      const res = await fetch("/api/ai/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: resume.targetRole || resume.personalInfo.jobTitle || "Engineer",
          existingSkills: existing,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to suggest skills.");

      if (data.suggested && data.suggested.length > 0) {
        updateResume((prev) => {
          const nextSkills = [...prev.skills];
          if (nextSkills.length === 0) {
            nextSkills.push({ category: "Key Technologies", items: data.suggested.slice(0, 8) });
          } else {
            nextSkills[0] = {
              ...nextSkills[0],
              items: Array.from(new Set([...nextSkills[0].items, ...data.suggested.slice(0, 6)])),
            };
          }
          return { ...prev, skills: nextSkills };
        });
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setAiSkillLoading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-sans">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium">Opening CareerForge Resume Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Top Application Header Toolbar */}
      <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between no-print shadow-xs">
        {/* Left: Back & Resume Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <input
            type="text"
            value={resume.title}
            onChange={(e) => updateResume((prev) => ({ ...prev, title: e.target.value }))}
            className="text-sm font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 text-slate-900 dark:text-white max-w-[240px] sm:max-w-xs truncate"
          />

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {saving ? "Saving..." : `Autosaved`}
          </span>
        </div>

        {/* Center: ATS Score Badge & Tailor CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAtsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">ATS Scanner & Tailor</span>
            {resume.lastAtsScore && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px]">
                {resume.lastAtsScore}%
              </span>
            )}
          </button>

          <button
            onClick={() => setIsVersionModalOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Version History & Checkpoints"
          >
            <History className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Export & Download Actions */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/resumes/${id}/export/docx`}
            download
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Download Word Document"
          >
            <FileDown className="h-3.5 w-3.5 text-slate-500" />
            DOCX
          </a>

          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </header>

      {/* Editor Body: Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Editor Panel */}
        <div className="w-full lg:w-[48%] xl:w-[45%] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col no-print h-[calc(100vh-3.5rem)]">
          {/* Section Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar px-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs shrink-0">
            {[
              { id: "personal", label: "Contact", icon: Briefcase },
              { id: "summary", label: "Summary", icon: Sparkles },
              { id: "experience", label: "Experience", icon: Layers },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "skills", label: "Skills", icon: Code },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "certifications", label: "Certs", icon: Award },
              { id: "design", label: "Design", icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Form Scrollable Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs rounded-lg border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: PERSONAL DETAILS */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Personal & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.fullName}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Role / Job Title *
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.jobTitle}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, jobTitle: e.target.value },
                          targetRole: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={resume.personalInfo.email}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.phone}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Location (City, State / Country)
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.location}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, location: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Personal Website / Portfolio URL
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.website || ""}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, website: e.target.value },
                        }))
                      }
                      placeholder="https://yourname.dev"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.linkedin || ""}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                        }))
                      }
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GitHub Profile
                    </label>
                    <input
                      type="text"
                      value={resume.personalInfo.github || ""}
                      onChange={(e) =>
                        updateResume((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, github: e.target.value },
                        }))
                      }
                      placeholder="github.com/username"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFESSIONAL SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Professional Summary
                  </h3>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={aiSummaryLoading}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-blue-600" />
                    {aiSummaryLoading ? "Generating with AI..." : "Enhance with AI"}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  A high-impact 3-4 sentence elevator pitch highlighting leadership, metrics, and core competencies.
                </p>

                <textarea
                  rows={6}
                  value={resume.summary}
                  onChange={(e) => updateResume((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Results-driven engineer with 5+ years of experience delivering scalable web systems..."
                  className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* TAB 3: WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Work Experience ({resume.experience.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Use the &quot;Enhance Bullet&quot; AI button to convert bullets to Google XYZ format.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newExp: ExperienceItem = {
                        id: `exp-${Date.now()}`,
                        company: "Company Name",
                        role: "Software Engineer",
                        location: "San Francisco, CA",
                        startDate: "2023",
                        endDate: "Present",
                        current: true,
                        bullets: ["Engineered scalable features driving positive user growth."],
                      };
                      updateResume((prev) => ({
                        ...prev,
                        experience: [newExp, ...prev.experience],
                      }));
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Position
                  </button>
                </div>

                <div className="space-y-4">
                  {resume.experience.map((exp, expIdx) => (
                    <div
                      key={exp.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Role #{expIdx + 1}
                        </span>
                        <button
                          onClick={() =>
                            updateResume((prev) => ({
                              ...prev,
                              experience: prev.experience.filter((e) => e.id !== exp.id),
                            }))
                          }
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Delete Position"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, role: e.target.value } : item
                              ),
                            }))
                          }
                          placeholder="Job Title"
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />

                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, company: e.target.value } : item
                              ),
                            }))
                          }
                          placeholder="Company Name"
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />

                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, location: e.target.value } : item
                              ),
                            }))
                          }
                          placeholder="Location (e.g. Remote / New York, NY)"
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateResume((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item) =>
                                  item.id === exp.id ? { ...item, startDate: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Start (2021)"
                            className="w-1/2 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                          />
                          <input
                            type="text"
                            value={exp.current ? "Present" : exp.endDate}
                            onChange={(e) =>
                              updateResume((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item) =>
                                  item.id === exp.id ? { ...item, endDate: e.target.value } : item
                                ),
                              }))
                            }
                            disabled={exp.current}
                            placeholder="End Date"
                            className="w-1/2 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, current: e.target.checked } : item
                              ),
                            }))
                          }
                          className="rounded text-blue-600"
                        />
                        I currently work here
                      </label>

                      {/* Bullets List */}
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Accomplishment Bullets
                        </span>
                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex gap-2">
                              <textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateResume((prev) => ({
                                    ...prev,
                                    experience: prev.experience.map((item) => {
                                      if (item.id !== exp.id) return item;
                                      const nextB = [...item.bullets];
                                      nextB[bIdx] = val;
                                      return { ...item, bullets: nextB };
                                    }),
                                  }));
                                }}
                                className="flex-1 p-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleImproveBullet(exp.id, bIdx, bullet)}
                                  disabled={aiBulletLoadingId === `${exp.id}-${bIdx}`}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-lg text-xs"
                                  title="Enhance with AI (Google XYZ formula)"
                                >
                                  {aiBulletLoadingId === `${exp.id}-${bIdx}` ? (
                                    <div className="h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    updateResume((prev) => ({
                                      ...prev,
                                      experience: prev.experience.map((item) => {
                                        if (item.id !== exp.id) return item;
                                        return {
                                          ...item,
                                          bullets: item.bullets.filter((_, i) => i !== bIdx),
                                        };
                                      }),
                                    }));
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                                  title="Remove Bullet"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            updateResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id
                                  ? { ...item, bullets: [...item.bullets, ""] }
                                  : item
                              ),
                            }));
                          }}
                          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 pt-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: EDUCATION */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Education
                  </h3>
                  <button
                    onClick={() => {
                      const newEdu: EducationItem = {
                        id: `edu-${Date.now()}`,
                        institution: "University Name",
                        degree: "Bachelor of Science",
                        fieldOfStudy: "Computer Science",
                        location: "City, State",
                        startDate: "2018",
                        endDate: "2022",
                      };
                      updateResume((prev) => ({
                        ...prev,
                        education: [...prev.education, newEdu],
                      }));
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Degree
                  </button>
                </div>

                <div className="space-y-3">
                  {resume.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {edu.degree || "Degree"}
                        </span>
                        <button
                          onClick={() =>
                            updateResume((prev) => ({
                              ...prev,
                              education: prev.education.filter((e) => e.id !== edu.id),
                            }))
                          }
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, degree: e.target.value } : item
                              ),
                            }))
                          }
                          placeholder="Degree (e.g. B.S., M.S.)"
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, fieldOfStudy: e.target.value } : item
                              ),
                            }))
                          }
                          placeholder="Field of Study (e.g. Computer Science)"
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, institution: e.target.value } : item
                              ),
                            }))
                          }
                          placeholder="College / University"
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={edu.startDate}
                            onChange={(e) =>
                              updateResume((prev) => ({
                                ...prev,
                                education: prev.education.map((item) =>
                                  item.id === edu.id ? { ...item, startDate: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Start (2018)"
                            className="w-1/2 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                          />
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) =>
                              updateResume((prev) => ({
                                ...prev,
                                education: prev.education.map((item) =>
                                  item.id === edu.id ? { ...item, endDate: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Graduation (2022)"
                            className="w-1/2 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SKILLS */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Technical & Core Skills
                    </h3>
                    <p className="text-xs text-slate-500">
                      Categorize by languages, frameworks, or domain tools.
                    </p>
                  </div>
                  <button
                    onClick={handleSuggestSkills}
                    disabled={aiSkillLoading}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-blue-600" />
                    {aiSkillLoading ? "Suggesting..." : "AI Suggest Skills"}
                  </button>
                </div>

                <div className="space-y-4">
                  {resume.skills.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateResume((prev) => {
                              const next = [...prev.skills];
                              next[idx] = { ...next[idx], category: val };
                              return { ...prev, skills: next };
                            });
                          }}
                          className="font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            updateResume((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={cat.items.join(", ")}
                        onChange={(e) => {
                          const items = e.target.value.split(",").map((s) => s.trim());
                          updateResume((prev) => {
                            const next = [...prev.skills];
                            next[idx] = { ...next[idx], items };
                            return { ...prev, skills: next };
                          });
                        }}
                        placeholder="Comma-separated items (e.g. TypeScript, React, Docker)"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      updateResume((prev) => ({
                        ...prev,
                        skills: [...prev.skills, { category: "New Category", items: [] }],
                      }));
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Skill Category
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Key Projects ({resume.projects.length})
                  </h3>
                  <button
                    onClick={() => {
                      const newProj: ProjectItem = {
                        id: `proj-${Date.now()}`,
                        title: "Project Title",
                        description: "High-performance web system solving real bottlenecks.",
                        bullets: ["Engineered core architecture."],
                        techStack: ["TypeScript", "Next.js"],
                      };
                      updateResume((prev) => ({
                        ...prev,
                        projects: [...prev.projects, newProj],
                      }));
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Project
                  </button>
                </div>

                <div className="space-y-4">
                  {resume.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p) =>
                                p.id === proj.id ? { ...p, title: e.target.value } : p
                              ),
                            }))
                          }
                          placeholder="Project Name"
                          className="font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() =>
                            updateResume((prev) => ({
                              ...prev,
                              projects: prev.projects.filter((p) => p.id !== proj.id),
                            }))
                          }
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={proj.link || ""}
                          onChange={(e) =>
                            updateResume((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p) =>
                                p.id === proj.id ? { ...p, link: e.target.value } : p
                              ),
                            }))
                          }
                          placeholder="Demo / Live Link"
                          className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={proj.techStack?.join(", ") || ""}
                          onChange={(e) => {
                            const stack = e.target.value.split(",").map((s) => s.trim());
                            updateResume((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p) =>
                                p.id === proj.id ? { ...p, techStack: stack } : p
                              ),
                            }));
                          }}
                          placeholder="Tech stack (e.g. Next.js, Redis)"
                          className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) =>
                          updateResume((prev) => ({
                            ...prev,
                            projects: prev.projects.map((p) =>
                              p.id === proj.id ? { ...p, description: e.target.value } : p
                            ),
                          }))
                        }
                        placeholder="Brief overview of problem and impact..."
                        className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg leading-relaxed focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Certifications & Achievements
                  </h3>
                  <button
                    onClick={() => {
                      const newCert: CertificationItem = {
                        id: `cert-${Date.now()}`,
                        name: "AWS Certified Solutions Architect",
                        issuer: "Amazon Web Services",
                        issueDate: "2023",
                      };
                      updateResume((prev) => ({
                        ...prev,
                        certifications: [...prev.certifications, newCert],
                      }));
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Certification
                  </button>
                </div>

                <div className="space-y-3">
                  {resume.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3"
                    >
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) =>
                          updateResume((prev) => ({
                            ...prev,
                            certifications: prev.certifications.map((c) =>
                              c.id === cert.id ? { ...c, name: e.target.value } : c
                            ),
                          }))
                        }
                        placeholder="Certification Name"
                        className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) =>
                          updateResume((prev) => ({
                            ...prev,
                            certifications: prev.certifications.map((c) =>
                              c.id === cert.id ? { ...c, issuer: e.target.value } : c
                            ),
                          }))
                        }
                        placeholder="Issuer (e.g. AWS)"
                        className="w-28 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                      <input
                        type="text"
                        value={cert.issueDate}
                        onChange={(e) =>
                          updateResume((prev) => ({
                            ...prev,
                            certifications: prev.certifications.map((c) =>
                              c.id === cert.id ? { ...c, issueDate: e.target.value } : c
                            ),
                          }))
                        }
                        placeholder="Year"
                        className="w-16 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                      <button
                        onClick={() =>
                          updateResume((prev) => ({
                            ...prev,
                            certifications: prev.certifications.filter((c) => c.id !== cert.id),
                          }))
                        }
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: DESIGN & TEMPLATES */}
            {activeTab === "design" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    ATS-Optimized Templates
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Switch styles with zero content loss. Each layout is tested for parser readability.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {RESUME_TEMPLATES.map((tmpl) => {
                      const isSelected = resume.templateId === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() =>
                            updateResume((prev) => ({
                              ...prev,
                              templateId: tmpl.id,
                              typography: { ...prev.typography, accentColor: tmpl.accentColor },
                            }))
                          }
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {tmpl.name}
                              {tmpl.isPro && (
                                <span className="text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  Pro
                                </span>
                              )}
                            </span>
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: tmpl.accentColor }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {tmpl.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Accent Color
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {ACCENT_COLORS.map((col) => (
                      <button
                        key={col.value}
                        onClick={() =>
                          updateResume((prev) => ({
                            ...prev,
                            typography: { ...prev.typography, accentColor: col.value },
                          }))
                        }
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform ${
                          resume.typography.accentColor === col.value
                            ? "scale-115 ring-2 ring-offset-2 ring-blue-500"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: col.value }}
                        title={col.name}
                      >
                        {resume.typography.accentColor === col.value && (
                          <Check className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Font Selection */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Font Family
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: "inter", label: "Sans (Inter)", class: "font-sans" },
                      { id: "serif", label: "Serif (Executive)", class: "font-serif" },
                      { id: "mono", label: "Mono (Technical)", class: "font-mono" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() =>
                          updateResume((prev) => ({
                            ...prev,
                            typography: { ...prev.typography, font: f.id as "inter" | "serif" | "mono" },
                          }))
                        }
                        className={`p-2.5 rounded-lg border text-center font-medium ${
                          resume.typography.font === f.id
                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "border-slate-200 dark:border-slate-800"
                        } ${f.class}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paper Format & Spacing */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                        Paper Format
                      </h4>
                      <div className="flex gap-2">
                        {["a4", "letter"].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() =>
                              updateResume((prev) => ({
                                ...prev,
                                layoutConfig: { ...prev.layoutConfig, paperFormat: fmt as "a4" | "letter" },
                              }))
                            }
                            className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded-lg border ${
                              resume.layoutConfig.paperFormat === fmt
                                ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                        Margins / Density
                      </h4>
                      <div className="flex gap-2">
                        {["compact", "normal", "spacious"].map((m) => (
                          <button
                            key={m}
                            onClick={() =>
                              updateResume((prev) => ({
                                ...prev,
                                layoutConfig: { ...prev.layoutConfig, margins: m as "compact" | "normal" | "spacious" },
                              }))
                            }
                            className={`flex-1 py-1.5 text-xs font-medium capitalize rounded-lg border ${
                              resume.layoutConfig.margins === m
                                ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Canvas Preview */}
        <div className="w-full lg:w-[52%] xl:w-[55%] bg-slate-200/80 dark:bg-slate-950 p-6 flex flex-col items-center justify-start overflow-y-auto relative h-[calc(100vh-3.5rem)]">
          {/* Zoom & Fit Floating Toolbar */}
          <div className="sticky top-2 z-20 mb-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-800 px-3 py-1 flex items-center gap-2 text-xs no-print">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => setZoom(0.85)}
              className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
            >
              Reset
            </button>
          </div>

          {/* Real-time Rendered Resume Page */}
          <ResumePreview resume={resume} scale={zoom} />
        </div>
      </div>

      {/* ATS Scanner & Tailoring Modal */}
      <AtsScoreModal
        resume={resume}
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        onApplySummary={(newSummary) => {
          updateResume((prev) => ({ ...prev, summary: newSummary }));
          setIsAtsModalOpen(false);
        }}
      />

      {/* Version History Checkpoint Modal */}
      <VersionHistoryModal
        resumeId={resume.id}
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onRestoreComplete={loadResume}
      />
    </div>
  );
}

export default function ResumeEditorPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Loading Resume Studio...</div>}>
      <ResumeEditorContent {...props} />
    </Suspense>
  );
}
