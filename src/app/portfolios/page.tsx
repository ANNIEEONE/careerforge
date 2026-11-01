"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface PortfolioItem {
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
  } | null;
  updatedAt: string;
}

export default function PortfoliosListPage() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [portRes, resRes] = await Promise.all([
        fetch("/api/portfolios"),
        fetch("/api/resumes"),
      ]);

      if (portRes.ok && portRes.headers.get("content-type")?.includes("application/json")) {
        const d = await portRes.json();
        setPortfolios(d.portfolios || []);
      } else {
        setPortfolios([
          {
            id: "demo-port-1",
            title: "Alex Rivera — Portfolio",
            tagline: "Building resilient distributed systems",
            slug: "alex-rivera",
            theme: "tech-dark",
            isPublished: true,
            viewsCount: 142,
            resume: { id: "demo-resume-1", title: "Senior Staff Distributed Systems Engineer Resume" },
            updatedAt: new Date().toISOString(),
          }
        ]);
      }
      if (resRes.ok && resRes.headers.get("content-type")?.includes("application/json")) {
        const r = await resRes.json();
        setResumes(r.resumes || []);
      } else {
        setResumes([{ id: "demo-resume-1", title: "Senior Staff Distributed Systems Engineer Resume" }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePortfolio = async (resumeId?: string) => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create portfolio.");
      router.push(`/portfolios/${data.portfolio.id}`);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete portfolio "${title}"?`)) return;
    try {
      await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      setPortfolios(portfolios.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Personal Portfolio Websites
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Publish and host responsive personal portfolios linked to your resume data.
            </p>
          </div>

          <button
            onClick={() => handleCreatePortfolio(resumes[0]?.id)}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            {creating ? (
              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            New Portfolio
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6"
              />
            ))}
          </div>
        ) : portfolios.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Globe className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No portfolios created yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Launch your personal website in seconds. Choose from minimalist, tech dark, or editorial themes.
            </p>
            <button
              onClick={() => handleCreatePortfolio(resumes[0]?.id)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Build First Portfolio
            </button>
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
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {portfolio.theme}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          portfolio.isPublished
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {portfolio.isPublished ? "● Live Published" : "Unpublished"}
                      </span>
                      <button
                        onClick={() => handleDelete(portfolio.id, portfolio.title)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                        onClick={() => copyUrl(portfolio.slug)}
                        className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded"
                        title="Copy link"
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
      </main>
    </div>
  );
}
