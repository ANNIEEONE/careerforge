"use client";

import { useState } from "react";
import { ResumeData, AtsScanResult } from "@/lib/types";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Copy,
  Check,
  Briefcase,
  Layers,
} from "lucide-react";

interface AtsScoreModalProps {
  resume: ResumeData;
  isOpen: boolean;
  onClose: () => void;
  onApplySummary: (newSummary: string) => void;
}

export default function AtsScoreModal({
  resume,
  isOpen,
  onClose,
  onApplySummary,
}: AtsScoreModalProps) {
  const [jobTitle, setJobTitle] = useState(resume.targetRole || "");
  const [company, setCompany] = useState(resume.targetCompany || "");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsScanResult | null>(null);
  const [engine, setEngine] = useState<"gemini" | "heuristic" | null>(null);
  const [appliedSummary, setAppliedSummary] = useState(false);

  // Cover letter tab state
  const [activeTab, setActiveTab] = useState<"ats" | "cover-letter">("ats");
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  if (!isOpen) return null;

  const handleRunScan = async () => {
    if (!jobDescription.trim() || !jobTitle.trim()) {
      setError("Please provide both a Target Job Title and Job Description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          jobTitle,
          company: company || "Target Company",
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan resume against job description.");
      }

      setResult(data.result);
      setEngine(data.engine);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setCoverLetterLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          jobTitle: jobTitle || "Target Role",
          company: company || "Target Organization",
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cover letter.");
      }

      setCoverLetter(data.coverLetter.content);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setCoverLetterLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI ATS Scanner & Job Tailoring
                {engine && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    engine === "gemini" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  }`}>
                    {engine === "gemini" ? "Google Gemini 2.5" : "Smart Heuristic"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Match your resume against any job description, uncover missing keywords, and tailor your content.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab("ats")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "ats"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            ATS Keyword & Match Analysis
          </button>
          <button
            onClick={() => {
              setActiveTab("cover-letter");
              if (!coverLetter && jobDescription) handleGenerateCoverLetter();
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "cover-letter"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Matching Cover Letter
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "ats" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Job Inputs */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe, Airbnb, Google"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paste Job Description *
                  </label>
                  <textarea
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job posting requirements, responsibilities, and qualifications..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleRunScan}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing ATS Compatibility...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze & Tailor Resume
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Scan Results */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                {result ? (
                  <div className="space-y-5">
                    {/* ATS Match Gauge */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                          Estimated ATS Match Score
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span
                            className={`text-4xl font-black ${
                              result.matchScore >= 80
                                ? "text-emerald-600 dark:text-emerald-400"
                                : result.matchScore >= 60
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-red-500"
                            }`}
                          >
                            {result.matchScore}%
                          </span>
                          <span className="text-xs text-slate-500">
                            {result.matchScore >= 80
                              ? "Excellent ATS alignment"
                              : result.matchScore >= 60
                              ? "Good match, missing key terms"
                              : "Needs significant keyword optimization"}
                          </span>
                        </div>
                      </div>
                      <div className="h-14 w-14 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            result.matchScore >= 80 ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"
                          }`}
                        >
                          ATS
                        </div>
                      </div>
                    </div>

                    {/* Matched Keywords */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Matched Keywords ({result.matchingKeywords.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        Missing High-Impact Keywords ({result.missingKeywords.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium"
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                          Optimization Recommendations
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500 font-bold">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tailored Professional Summary */}
                    {result.tailoredSummary && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            AI-Tailored Professional Summary
                          </h4>
                          <button
                            onClick={() => {
                              onApplySummary(result.tailoredSummary || "");
                              setAppliedSummary(true);
                              setTimeout(() => setAppliedSummary(false), 2000);
                            }}
                            className="text-xs px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center gap-1"
                          >
                            {appliedSummary ? (
                              <>
                                <Check className="h-3 w-3" />
                                Applied!
                              </>
                            ) : (
                              <>
                                Apply to Resume
                                <ArrowRight className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed italic">
                          {result.tailoredSummary}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Layers className="h-10 w-10 mb-2 opacity-40 text-blue-500" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      No scan results yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Paste a target job description and click &quot;Analyze & Tailor Resume&quot; to inspect your score, uncovered keywords, and optimized phrasing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Cover Letter Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tailored Cover Letter for {jobTitle || "Your Target Role"} at {company || "Target Company"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generated from your real resume experience and the target job description.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={coverLetterLoading}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    {coverLetterLoading ? "Regenerating..." : "Regenerate"}
                  </button>
                  {coverLetter && (
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copiedCoverLetter ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedCoverLetter ? "Copied!" : "Copy Text"}
                    </button>
                  )}
                </div>
              </div>

              {coverLetterLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm">Synthesizing personalized cover letter...</p>
                </div>
              ) : coverLetter ? (
                <textarea
                  rows={14}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-4 text-xs font-serif bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50 text-blue-500" />
                  <p className="text-xs">
                    Click &quot;Regenerate&quot; to synthesize an ATS-aligned cover letter tailored to this position.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
