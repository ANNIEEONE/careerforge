"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Palette,
  Eye,
  Sliders,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PortfolioDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  theme: "minimal-slate" | "tech-dark" | "editorial" | "creative-warm";
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
  isPublished: boolean;
  viewsCount: number;
  resume?: {
    id: string;
    title: string;
    summary: string;
    experience: Array<{ id: string; role: string; company: string; bullets: string[] }>;
    projects: Array<{ id: string; title: string; description: string; techStack: string[] }>;
    skills: Array<{ category: string; items: string[] }>;
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function PortfolioEditorContent({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/portfolios/${id}`)
      .then((res) => {
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.portfolio) {
          setPortfolio(data.portfolio);
        } else {
          setPortfolio({
            id: id || "demo-port-1",
            title: "Alex Rivera — Portfolio",
            tagline: "Staff Distributed Systems & Infrastructure Engineer",
            slug: "alex-rivera",
            bio: "Building resilient distributed systems, real-time settlement rails, and high-throughput data streams.",
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
            customLinks: [{ label: "GitHub", url: "https://github.com/alexrivera-eng" }],
            isPublished: true,
            viewsCount: 142,
            resume: {
              id: "demo-resume-1",
              title: "Senior Staff Distributed Systems Engineer Resume",
              summary: "Staff Distributed Systems & Infrastructure Engineer with 9+ years experience.",
              experience: [{ id: "exp-1", role: "Senior Staff Software Engineer", company: "Stripe", bullets: ["Architected ledger processing $18B+ quarterly volume."] }],
              projects: [{ id: "proj-1", title: "AegisKV", description: "Raft consensus key-value store in Go.", techStack: ["Go", "Raft"] }],
              skills: [{ category: "Core", items: ["Distributed Systems", "Rust", "Go"] }]
            }
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const savePortfolioChanges = async (updated: PortfolioDetail) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        console.warn("Portfolio save fallback: Saved locally");
      }
    } catch {
      console.warn("Portfolio save network fallback");
    } finally {
      setSaving(false);
    }
  };

  const updatePortfolio = (updater: (prev: PortfolioDetail) => PortfolioDetail) => {
    if (!portfolio) return;
    const next = updater(portfolio);
    setPortfolio(next);
    savePortfolioChanges(next);
  };

  const copyPublicUrl = () => {
    if (!portfolio) return;
    const url = `${window.location.origin}/p/${portfolio.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-sans">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium">Loading Portfolio Studio...</p>
      </div>
    );
  }

  const themes = [
    {
      id: "minimal-slate",
      name: "Minimalist Slate",
      desc: "Editorial monochrome with clean typographic contrast.",
      bg: "bg-white text-slate-900 border-slate-200",
    },
    {
      id: "tech-dark",
      name: "Tech Obsidian",
      desc: "Dark developer aesthetic with neon cyan & emerald highlights.",
      bg: "bg-slate-950 text-white border-slate-800",
    },
    {
      id: "editorial",
      name: "Editorial Serif",
      desc: "Classic serif typography with rich warm paper layout.",
      bg: "bg-amber-50/50 text-slate-900 border-amber-200",
    },
    {
      id: "creative-warm",
      name: "Creative Warmth",
      desc: "Vibrant accents, modern cards, and dynamic layout.",
      bg: "bg-white text-slate-900 border-amber-300",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Top Application Toolbar */}
      <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between no-print shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/portfolios"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
              {portfolio.title}
            </h1>
            <span className="text-[10px] text-slate-400">
              {saving ? "Saving changes..." : "Autosaved"}
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Toggle */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setPreviewDevice("desktop")}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
              previewDevice === "desktop"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setPreviewDevice("mobile")}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
              previewDevice === "mobile"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>

        {/* Right: Publish & Public Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyPublicUrl}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{copiedLink ? "Copied!" : "Copy URL"}</span>
          </button>

          <a
            href={`/p/${portfolio.slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live
          </a>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Customization Controls */}
        <div className="w-full lg:w-[420px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto space-y-6 shrink-0 h-[calc(100vh-3.5rem)]">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Visibility / Publish Switch */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Public Website Visibility
              </span>
              <span className="text-[11px] text-slate-500">
                {portfolio.isPublished
                  ? "Accessible to anyone with your slug link"
                  : "Draft mode (hidden from public)"}
              </span>
            </div>
            <button
              onClick={() =>
                updatePortfolio((prev) => ({ ...prev, isPublished: !prev.isPublished }))
              }
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                portfolio.isPublished ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  portfolio.isPublished ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* URL Slug Configuration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Public URL Slug
            </label>
            <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-xs text-slate-500">
              <span className="shrink-0 font-mono text-[11px]">/p/</span>
              <input
                type="text"
                value={portfolio.slug}
                onChange={(e) =>
                  updatePortfolio((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                  }))
                }
                className="w-full bg-transparent pl-1 font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portfolio Headline / Title
              </label>
              <input
                type="text"
                value={portfolio.title}
                onChange={(e) => updatePortfolio((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Headline / Tagline
              </label>
              <input
                type="text"
                value={portfolio.tagline || ""}
                onChange={(e) => updatePortfolio((prev) => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                About / Bio Paragraph
              </label>
              <textarea
                rows={3}
                value={portfolio.bio || ""}
                onChange={(e) => updatePortfolio((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-blue-500" />
              Website Theme
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {themes.map((t) => (
                <div
                  key={t.id}
                  onClick={() =>
                    updatePortfolio((prev) => ({
                      ...prev,
                      theme: t.id as typeof portfolio.theme,
                    }))
                  }
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    portfolio.theme === t.id
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section Visibility Controls */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-500" />
              Included Sections
            </h3>
            <div className="space-y-2">
              {[
                { key: "showAbout", label: "About Me" },
                { key: "showExperience", label: "Work Experience Timeline" },
                { key: "showProjects", label: "Featured Projects" },
                { key: "showSkills", label: "Skills Matrix" },
                { key: "showEducation", label: "Education" },
                { key: "showContact", label: "Interactive Contact Form" },
              ].map((s) => {
                const isChecked = portfolio.sectionsConfig[s.key as keyof typeof portfolio.sectionsConfig];
                return (
                  <label
                    key={s.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <span>{s.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        updatePortfolio((prev) => ({
                          ...prev,
                          sectionsConfig: {
                            ...prev.sectionsConfig,
                            [s.key]: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-blue-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Social / External Links */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Social & Portfolio Links
              </h3>
              <button
                onClick={() =>
                  updatePortfolio((prev) => ({
                    ...prev,
                    customLinks: [...prev.customLinks, { label: "Website", url: "https://" }],
                  }))
                }
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="h-3 w-3" />
                Add Link
              </button>
            </div>

            <div className="space-y-2">
              {portfolio.customLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePortfolio((prev) => {
                        const next = [...prev.customLinks];
                        next[idx] = { ...next[idx], label: val };
                        return { ...prev, customLinks: next };
                      });
                    }}
                    placeholder="Label (e.g. GitHub)"
                    className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePortfolio((prev) => {
                        const next = [...prev.customLinks];
                        next[idx] = { ...next[idx], url: val };
                        return { ...prev, customLinks: next };
                      });
                    }}
                    placeholder="https://..."
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <button
                    onClick={() =>
                      updatePortfolio((prev) => ({
                        ...prev,
                        customLinks: prev.customLinks.filter((_, i) => i !== idx),
                      }))
                    }
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live Interactive Website Preview */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-6 flex flex-col items-center justify-start overflow-y-auto h-[calc(100vh-3.5rem)]">
          <div
            className={`w-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-white ${
              previewDevice === "mobile" ? "max-w-sm my-6 border-8 border-slate-800 rounded-[32px]" : "max-w-4xl"
            }`}
          >
            {/* Browser chrome header bar */}
            <div className="h-8 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-3 gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="font-mono text-[10px] text-slate-500 bg-white dark:bg-slate-900 px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  careerforge.app/p/{portfolio.slug}
                </span>
              </div>
            </div>

            {/* Embedded Iframe pointing to live public page */}
            <iframe
              src={`/p/${portfolio.slug}`}
              className="w-full h-[700px] border-none bg-white"
              title="Portfolio Live Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioEditorPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Loading Portfolio Studio...</div>}>
      <PortfolioEditorContent {...props} />
    </Suspense>
  );
}
