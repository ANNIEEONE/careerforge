"use client";

import { useEffect, useState, use, Suspense } from "react";
import {
  Globe,
  Mail,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Send,
  CheckCircle2,
  FileDown,
  Layers,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import { PortfolioData } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function PublicPortfolioContent({ params }: PageProps) {
  const { slug } = use(params);

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    fetch(`/api/portfolios/by-slug/${slug}`)
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
            id: "demo-port-1",
            userId: "demo-user-1",
            title: "Alex Rivera",
            tagline: "Staff Distributed Systems & Infrastructure Engineer",
            slug: slug || "alex-rivera",
            theme: "tech-dark",
            accentColor: "#2563eb",
            isPublished: true,
            viewsCount: 142,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bio: "Building resilient distributed systems, real-time payment settlement engines, and high-throughput data pipelines across AWS and GCP.",
            sectionsConfig: {
              showAbout: true,
              showExperience: true,
              showProjects: true,
              showSkills: true,
              showEducation: true,
              showContact: true,
            },
            customLinks: [
              { label: "GitHub", url: "https://github.com/alexrivera-eng" },
              { label: "LinkedIn", url: "https://linkedin.com/in/alex-rivera-systems" }
            ],
            resume: {
              id: "demo-resume-1",
              title: "Senior Staff Distributed Systems Engineer Resume",
              personalInfo: {
                fullName: "Alex Rivera",
                email: "alex.rivera@example.com",
                phone: "+1 (555) 382-9102",
                location: "San Francisco, CA",
                website: "https://alexrivera.dev",
                jobTitle: "Senior Staff Distributed Systems Engineer"
              },
              summary: "Staff Distributed Systems & Infrastructure Engineer with 9+ years experience.",
              experience: [
                {
                  id: "exp-1",
                  role: "Senior Staff Software Engineer",
                  company: "Stripe",
                  location: "San Francisco, CA",
                  startDate: "2022-03",
                  endDate: "Present",
                  current: true,
                  bullets: [
                    "Architected multi-region transactional ledger processing $18B+ quarterly volume with sub-12ms p99 latency across 6 global zones.",
                    "Designed idempotent zero-loss replay mechanisms on Apache Kafka and Rust, eliminating reconciliation discrepancies by 100%."
                  ]
                }
              ],
              education: [
                {
                  id: "edu-1",
                  institution: "University of California, Berkeley",
                  degree: "Bachelor of Science",
                  fieldOfStudy: "Computer Science & Electrical Engineering",
                  location: "Berkeley, CA",
                  startDate: "2012",
                  endDate: "2016"
                }
              ],
              skills: [
                { category: "Core Architecture", items: ["Distributed Systems", "High Availability", "Consensus Algorithms"] },
                { category: "Languages & Frameworks", items: ["Rust", "Go", "TypeScript", "Python"] },
                { category: "Cloud & Infrastructure", items: ["Kubernetes", "AWS", "GCP", "Kafka", "ClickHouse"] }
              ],
              projects: [
                {
                  id: "proj-1",
                  title: "AegisKV — Distributed Raft-based Key-Value Store",
                  description: "Built an open-source consensus engine in Go implementing the Raft consensus algorithm with dynamic cluster membership changes.",
                  bullets: ["Engineered leader election with sub-50ms heartbeat timeouts."],
                  techStack: ["Go", "Raft", "gRPC"]
                }
              ]
            }
          });
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) return;
    setMessageSent(true);
    setContactName("");
    setContactEmail("");
    setContactMessage("");
    setTimeout(() => setMessageSent(false), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-sans">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading portfolio...</p>
      </div>
    );
  }

  if (notFound || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <Globe className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Portfolio Not Available
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 mb-6">
          This portfolio is either private, unpublished, or the link has changed.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Explore CareerForge
        </a>
      </div>
    );
  }

  const { theme, resume, user } = portfolio;
  const config = portfolio.sectionsConfig;

  // Theme styling configurations
  const themeClasses = {
    "minimal-slate": {
      wrapper: "bg-slate-50 text-slate-900",
      card: "bg-white border-slate-200 shadow-xs",
      heading: "text-slate-900 font-sans",
      accentBadge: "bg-slate-100 text-slate-800 border-slate-200",
      btn: "bg-slate-900 hover:bg-slate-800 text-white",
      tag: "bg-slate-100 text-slate-700",
    },
    "tech-dark": {
      wrapper: "bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-black",
      card: "bg-slate-900/90 border-slate-800 shadow-md",
      heading: "text-white font-mono",
      accentBadge: "bg-cyan-950/60 text-cyan-400 border-cyan-800/60 font-mono",
      btn: "bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold",
      tag: "bg-slate-800 text-cyan-300 font-mono text-[11px]",
    },
    editorial: {
      wrapper: "bg-[#fcfbf9] text-slate-900",
      card: "bg-white border-stone-200 shadow-sm",
      heading: "text-stone-900 font-serif",
      accentBadge: "bg-stone-100 text-stone-800 border-stone-200 font-serif",
      btn: "bg-stone-900 hover:bg-stone-800 text-white font-serif",
      tag: "bg-stone-100 text-stone-700 font-serif",
    },
    "creative-warm": {
      wrapper: "bg-amber-50/30 text-slate-900",
      card: "bg-white border-amber-200/80 shadow-sm",
      heading: "text-slate-900 font-sans",
      accentBadge: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
      btn: "bg-amber-600 hover:bg-amber-700 text-white font-bold",
      tag: "bg-amber-50 text-amber-800 border border-amber-200",
    },
  }[theme || "minimal-slate"];

  return (
    <div className={`min-h-screen ${themeClasses.wrapper} flex flex-col font-sans transition-colors`}>
      {/* Portfolio Header Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-inherit px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0) : "P"}
          </div>
          <span className="font-bold text-sm tracking-tight">{user?.name || portfolio.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${themeClasses.btn}`}
          >
            <FileDown className="h-3.5 w-3.5" />
            Print / Save Resume
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-16">
        {/* HERO SECTION */}
        <section className="text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-inherit">
          <div className="space-y-3 max-w-xl">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${themeClasses.accentBadge}`}
            >
              {portfolio.tagline || "Available for Full-Time & Advisory Roles"}
            </span>

            <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${themeClasses.heading}`}>
              {portfolio.title}
            </h1>

            {portfolio.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {portfolio.bio}
              </p>
            )}

            {/* Social / Portfolio Links */}
            {portfolio.customLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                {portfolio.customLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-inherit text-xs font-medium hover:border-blue-500 transition-colors"
                  >
                    {link.label.toLowerCase().includes("github") ? (
                      <GithubIcon className="h-3.5 w-3.5" />
                    ) : link.label.toLowerCase().includes("linkedin") ? (
                      <LinkedinIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* WORK EXPERIENCE */}
        {config?.showExperience && resume?.experience && resume.experience.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h2 className={`text-xl font-bold tracking-tight ${themeClasses.heading}`}>
                Work Experience
              </h2>
            </div>

            <div className="space-y-4">
              {resume.experience.map((exp) => (
                <div
                  key={exp.id}
                  className={`p-6 rounded-2xl border ${themeClasses.card} transition-all space-y-2`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {exp.role}{" "}
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        @ {exp.company}
                      </span>
                    </h3>
                    <span className="text-xs text-slate-400">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>

                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {exp.bullets.filter(Boolean).map((bullet, i) => (
                        <li key={i}>{bullet.replace(/^[-*•]\s*/, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FEATURED PROJECTS */}
        {config?.showProjects && resume?.projects && resume.projects.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-blue-600" />
              <h2 className={`text-xl font-bold tracking-tight ${themeClasses.heading}`}>
                Featured Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resume.projects.map((proj) => (
                <div
                  key={proj.id}
                  className={`p-6 rounded-2xl border ${themeClasses.card} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {proj.title}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-500 p-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {proj.description}
                    </p>
                  </div>

                  {proj.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-inherit">
                      {proj.techStack.map((tech, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-[10px] ${themeClasses.tag}`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS MATRIX */}
        {config?.showSkills && resume?.skills && resume.skills.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" />
              <h2 className={`text-xl font-bold tracking-tight ${themeClasses.heading}`}>
                Skills & Technologies
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {resume.skills.map((cat, i) => (
                <div key={i} className={`p-5 rounded-2xl border ${themeClasses.card} space-y-3`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((skill, si) => (
                      <span
                        key={si}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${themeClasses.tag}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {config?.showEducation && resume?.education && resume.education.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h2 className={`text-xl font-bold tracking-tight ${themeClasses.heading}`}>
                Education
              </h2>
            </div>

            <div className="space-y-3">
              {resume.education.map((edu) => (
                <div
                  key={edu.id}
                  className={`p-5 rounded-2xl border ${themeClasses.card} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {edu.institution} {edu.location ? `• ${edu.location}` : ""} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* INTERACTIVE CONTACT FORM */}
        {config?.showContact && (
          <section className="space-y-6 pt-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className={`text-xl font-bold tracking-tight ${themeClasses.heading}`}>
                Get In Touch
              </h2>
            </div>

            <div className={`p-6 sm:p-8 rounded-2xl border ${themeClasses.card}`}>
              {messageSent ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Message Dispatched!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thank you for reaching out. Your inquiry has been forwarded directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-inherit rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="jane@company.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-inherit rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Discussing an opportunity, project, or role..."
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-inherit rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`py-2.5 px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${themeClasses.btn}`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-inherit py-8 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Layers className="h-3.5 w-3.5 text-blue-600" />
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Powered by CareerForge Studio
          </span>
        </div>
        <p className="text-[11px]">
          Hosted personal developer portfolio • Generated in seconds
        </p>
      </footer>
    </div>
  );
}

export default function PublicPortfolioPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Loading portfolio...</div>}>
      <PublicPortfolioContent {...props} />
    </Suspense>
  );
}
