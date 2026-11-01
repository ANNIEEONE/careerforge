"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Cpu,
  Layers,
  FileCheck,
  ChevronRight,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const [activeTemplateTab, setActiveTemplateTab] = useState<"modern" | "minimal" | "executive">("modern");

  const faqs = [
    {
      q: "How does the AI Resume Tailoring work?",
      a: "CareerForge parses the exact technical skills, responsibilities, and competencies from any pasted job posting. It then analyzes your resume against these requirements, identifies missing keywords, computes an ATS match score, and suggests tailored accomplishment bullets using the Google XYZ formula — without fabricating false credentials.",
    },
    {
      q: "Can I export my resume to both PDF and Microsoft Word (.docx)?",
      a: "Yes. CareerForge offers high-fidelity downloadable PDFs matching the live editor typography and spacing, as well as native, editable .docx files formatted for ATS screening systems.",
    },
    {
      q: "How does the Portfolio Builder work?",
      a: "With one click, CareerForge converts your resume data into an interactive, responsive personal website with customizable themes, live project links, and your own public slug URL.",
    },
    {
      q: "What is the difference between Free and Pro tiers?",
      a: "The Free plan allows you to create up to 3 resumes, access our standard ATS templates, and run up to 15 AI writing assistance actions. The Pro plan (₹59/mo) provides unlimited resumes, all premium Pinterest & executive templates (Swiss Split Sidebar, Quiet Luxury Editorial, Silicon Tech Matrix, Nordic Bauhaus, Ivy League), unlimited AI job tailoring scans, and cover letter synthesis.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.12),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-6 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>CareerForge Studio 2.0 • Powered by Google Gemini</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
            Build Resumes That Beat the ATS & Publish Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
              Developer Portfolio
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Architect interview-ready resumes, tailor them against real job descriptions in seconds, export pixel-perfect PDFs, and deploy your personal portfolio website with zero friction.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              Start Building Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4 text-slate-500" />
              Upload & Parse Resume
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            No credit card required • Instant PDF & DOCX export • 100% private
          </p>
        </div>

        {/* Hero Interactive Preview Showcase */}
        <div className="mt-14 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 px-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">careerforge.app/studio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  ATS Score: 94%
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Simulated Live Split Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 text-left">
              {/* Left Side: AI Assistant Panel */}
              <div className="md:col-span-5 space-y-3 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  AI Writing & Bullet Optimizer
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-red-500">Before (Passive):</span>
                  <p className="text-slate-500 italic text-[11px]">
                    &quot;Helped build our cloud platform and wrote tests.&quot;
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    After (Google XYZ Metric-Driven):
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-relaxed">
                    &quot;Spearheaded migration of legacy monolith to containerized Kubernetes microservices, reducing cloud overhead by $85K/year and achieving 99.98% uptime.&quot;
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                    + Kubernetes
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                    + CI/CD
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                    + Distributed Systems
                  </span>
                </div>
              </div>

              {/* Right Side: Resume Document Preview */}
              <div className="md:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3 font-sans">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2 text-center">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Alex Rivera</h3>
                  <p className="text-[11px] text-blue-600 font-medium">Senior Full-Stack Engineer</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">alex.rivera@example.com • San Francisco, CA • github.com/alexrivera</p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-600 border-b border-blue-200 dark:border-blue-900 pb-0.5 mb-1.5">
                    Experience
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="font-semibold text-slate-900 dark:text-white">Lead Software Engineer — Vanguard Systems</span>
                      <span className="text-slate-400 text-[10px]">2022 – Present</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      • Spearheaded redesign of core data ingestion pipeline using TypeScript and Go, decreasing latency by 38% for 4.2M daily active records.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-600 border-b border-blue-200 dark:border-blue-900 pb-0.5 mb-1.5">
                    Skills & Technologies
                  </h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                    TypeScript, React, Next.js, Node.js, Go, PostgreSQL, Redis, Docker, Kubernetes, AWS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400">
              Complete Career Engineering
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Everything You Need to Land Interviews
            </p>
            <p className="mt-3 text-sm text-slate-500">
              From drafting bullet points to public web hosting, built without shortcuts or simulated placeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Real AI Writing Assistant
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Transform rough notes into executive summaries and punchy XYZ accomplishment bullets. Powered by Google Gemini with graceful fallback modes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                ATS Keyword Tailoring
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste any job description to discover missing high-value keywords and get an estimated match score before submitting your application.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center mb-4">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                One-Click Web Portfolio
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically generate a live personal portfolio website from your resume, with multiple themes and a custom public URL slug.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400">
              Transparent Freemium Model
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Choose the Plan for Your Career
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Start building for free today. Upgrade when you need advanced AI scans and full customization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-4">
                  STARTER
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Free Forever</h3>
                <p className="text-xs text-slate-500 mt-1">Perfect for drafting your standard resume.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹0</span>
                  <span className="text-xs text-slate-500 ml-2">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    Up to 3 Active Resumes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    Modern & Minimalist ATS Templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    15 AI Writing Credits / month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    PDF & DOCX Export
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    1 Published Portfolio Website
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="mt-8 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs rounded-xl text-center transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900 border-2 border-blue-600 dark:border-blue-500 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 mb-4">
                  PROFESSIONAL
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pro Studio</h3>
                <p className="text-xs text-slate-500 mt-1">For active job seekers who want maximal conversion.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹59</span>
                  <span className="text-xs text-slate-500 ml-2">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <strong>Unlimited Resumes</strong> & Document Versions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <strong>All 8 Premium Pinterest & ATS Templates</strong> (Swiss Sidebar, Quiet Luxury, Nordic, Tech Matrix)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <strong>Unlimited AI Writing & Tailoring</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <strong>Job-Description ATS Match Scanner</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <strong>Custom Cover Letter Generator</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    Unlimited Portfolio Websites & Custom Domain Ready
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="mt-8 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl text-center shadow-md shadow-blue-500/20 transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400">
              FAQ
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{faq.q}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">
              CF
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">CareerForge Studio</span>
            <span>• Production-Ready Resume & Portfolio Builder</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="hover:text-slate-800 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="hover:text-slate-800 dark:hover:text-white transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
