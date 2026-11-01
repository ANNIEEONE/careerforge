"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Globe,
  Plus,
  Upload,
  Copy,
  Trash2,
  ExternalLink,
  Sparkles,
  Search,
  MoreVertical,
  Check,
  Crown,
  FileCheck,
  Briefcase,
  AlertCircle,
  Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import UploadModal from "@/components/UploadModal";
import { UserSession } from "@/lib/types";

interface ResumeListItem {
  id: string;
  title: string;
  targetRole: string | null;
  targetCompany: string | null;
  templateId: string;
  lastAtsScore: number | null;
  isPublic: boolean;
  shareSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioListItem {
  id: string;
  title: string;
  tagline: string | null;
  slug: string;
  theme: string;
  isPublished: boolean;
  viewsCount: number;
  resume?: {
    id: string;
    title: string;
    targetRole: string | null;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [creatingResume, setCreatingResume] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      let userData: UserSession | null = null;
      let resumesList: ResumeListItem[] | null = null;
      let portfoliosList: PortfolioListItem[] | null = null;

      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok && userRes.headers.get("content-type")?.includes("application/json")) {
          const u = await userRes.json();
          userData = u.user;
        }
      } catch {
        // network or static host fallback
      }

      if (!userData) {
        const cachedUser = typeof window !== "undefined" ? localStorage.getItem("careerforge_user") : null;
        if (cachedUser) {
          try {
            userData = JSON.parse(cachedUser);
          } catch {
            // ignore
          }
        }
      }

      if (!userData) {
        userData = {
          id: "demo-user-1",
          name: "Alex Rivera",
          email: "alex.rivera@example.com",
          role: "USER",
          plan: "PRO",
          aiCreditsUsed: 42,
          aiCreditsLimit: 100,
          onboardingCompleted: true,
          hasCustomKey: false,
        };
      }
      setUser(userData);

      try {
        const resumesRes = await fetch("/api/resumes");
        if (resumesRes.ok && resumesRes.headers.get("content-type")?.includes("application/json")) {
          const r = await resumesRes.json();
          resumesList = r.resumes;
        }
      } catch {
        // fallback
      }

      if (!resumesList || resumesList.length === 0) {
        resumesList = [
          {
            id: "demo-resume-1",
            title: "Senior Staff Distributed Systems Engineer Resume",
            targetRole: "Staff Software Engineer",
            targetCompany: "Google / Stripe",
            templateId: "swiss-sidebar",
            lastAtsScore: 94,
            isPublic: true,
            shareSlug: "alex-rivera-systems",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "demo-resume-2",
            title: "Lead Full-Stack Developer Resume",
            targetRole: "Lead Full-Stack Engineer",
            targetCompany: "Vercel / Linear",
            templateId: "editorial-luxury",
            lastAtsScore: 88,
            isPublic: false,
            shareSlug: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
      }
      setResumes(resumesList);

      try {
        const portfoliosRes = await fetch("/api/portfolios");
        if (portfoliosRes.ok && portfoliosRes.headers.get("content-type")?.includes("application/json")) {
          const p = await portfoliosRes.json();
          portfoliosList = p.portfolios;
        }
      } catch {
        // fallback
      }

      if (!portfoliosList || portfoliosList.length === 0) {
        portfoliosList = [
          {
            id: "demo-port-1",
            title: "Alex Rivera — Portfolio",
            tagline: "Building resilient distributed systems",
            slug: "alex-rivera",
            theme: "tech-dark",
            isPublished: true,
            viewsCount: 142,
            resume: { id: "demo-resume-1", title: "Senior Staff Distributed Systems Engineer Resume", targetRole: "Staff Software Engineer" }
          }
        ];
      }
      setPortfolios(portfoliosList);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNewResume = async () => {
    setCreatingResume(true);
    setError(null);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Resume",
          targetRole: user?.name ? `${user.name}'s Target Role` : "Software Engineer",
        }),
      });

      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        router.push(`/resumes/${data.resume.id}`);
        return;
      }
    } catch {
      // Static fallback
    }

    // Direct to demo resume editor on static Netlify preview
    router.push("/resumes/demo-resume-1");
    setCreatingResume(false);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate resume.");
      await fetchDashboardData();
      setActiveMenuId(null);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete resume.");
      setResumes(resumes.filter((r) => r.id !== id));
      setActiveMenuId(null);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCreatePortfolioFromResume = async (resumeId: string) => {
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/portfolios/${data.portfolio.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyPublicUrl = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredResumes = resumes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.targetRole && r.targetRole.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner & Stats */}
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Welcome back, {user?.name || "Professional"}
                {user?.plan === "PRO" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    <Crown className="h-3 w-3 text-amber-500" />
                    Pro Studio
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage your active resumes, tailor applications, and monitor your personal portfolio website.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 text-[11px] block">Resumes</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {resumes.length}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {user?.plan === "PRO" ? "∞" : "3 limit"}
                  </span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 text-[11px] block">AI Credits</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {user?.plan === "PRO" ? "Unlimited" : `${Math.max(0, (user?.aiCreditsLimit || 15) - (user?.aiCreditsUsed || 0))} left`}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 text-[11px] block">Portfolio Views</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {portfolios.reduce((acc, p) => acc + p.viewsCount, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs rounded-xl border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes("limit") && (
              <Link
                href="/settings?tab=billing"
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        )}

        {/* Action Header & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              Import PDF / DOCX
            </button>

            <button
              onClick={handleCreateNewResume}
              disabled={creatingResume}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {creatingResume ? (
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              New Resume
            </button>
          </div>
        </div>

        {/* Resumes Grid */}
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Resumes ({filteredResumes.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6"
                />
              ))}
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No resumes found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                {searchQuery
                  ? "No resumes matched your search term."
                  : "You haven't created any resumes yet. Start fresh or import your existing PDF."}
              </p>
              <button
                onClick={handleCreateNewResume}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Create First Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {resume.templateId}
                        </span>
                      </div>

                      {/* Dropdown Options */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === resume.id ? null : resume.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenuId === resume.id && (
                          <div className="absolute right-0 top-6 z-20 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 text-xs">
                            <button
                              onClick={() => handleDuplicate(resume.id)}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Duplicate Resume
                            </button>
                            <a
                              href={`/api/resumes/${resume.id}/export/docx`}
                              download
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                            >
                              <Briefcase className="h-3.5 w-3.5" />
                              Download DOCX
                            </a>
                            <button
                              onClick={() => handleCreatePortfolioFromResume(resume.id)}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                            >
                              <Globe className="h-3.5 w-3.5 text-blue-500" />
                              Build Portfolio
                            </button>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                            <button
                              onClick={() => handleDelete(resume.id, resume.title)}
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Resume
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/resumes/${resume.id}`} className="block group">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {resume.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {resume.targetRole || "General Professional"}
                      </p>
                    </Link>

                    {resume.lastAtsScore && (
                      <div className="mt-4 flex items-center gap-1.5">
                        <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          ATS Score: {resume.lastAtsScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                    <Link
                      href={`/resumes/${resume.id}`}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open Editor →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolios Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Personal Portfolios ({portfolios.length})
            </h2>
            {resumes.length > 0 && portfolios.length === 0 && (
              <button
                onClick={() => handleCreatePortfolioFromResume(resumes[0].id)}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Publish from Resume
              </button>
            )}
          </div>

          {portfolios.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <Globe className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No portfolio published yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Instantly turn any of your resumes into an interactive, beautifully designed personal website.
              </p>
              {resumes.length > 0 ? (
                <button
                  onClick={() => handleCreatePortfolioFromResume(resumes[0].id)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Generate Portfolio from {resumes[0].title}
                </button>
              ) : (
                <span className="text-xs text-slate-400">Create a resume first to generate a portfolio.</span>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                          <Globe className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {portfolio.theme}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          portfolio.isPublished
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {portfolio.isPublished ? "● Live Published" : "Unpublished"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {portfolio.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {portfolio.tagline || "Personal Portfolio"}
                    </p>

                    <div className="mt-4 flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                      <span className="font-mono text-[11px] text-blue-600 truncate max-w-[160px]">
                        /p/{portfolio.slug}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyPublicUrl(portfolio.slug)}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded"
                          title="Copy public link"
                        >
                          {copiedSlug === portfolio.slug ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={`/p/${portfolio.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-500 hover:text-blue-600"
                          title="Open live website"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {portfolio.viewsCount} visits
                    </span>
                    <Link
                      href={`/portfolios/${portfolio.id}`}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Customize Portfolio →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
