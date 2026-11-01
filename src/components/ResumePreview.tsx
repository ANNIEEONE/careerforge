"use client";

import React from "react";
import { ResumeData } from "@/lib/types";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";

interface ResumePreviewProps {
  resume: ResumeData;
  scale?: number;
  printMode?: boolean;
}

export default function ResumePreview({
  resume,
  scale = 1,
  printMode = false,
}: ResumePreviewProps) {
  const {
    personalInfo,
    summary,
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    achievements = [],
    languages = [],
    customSections = [],
    sectionOrder = [],
    sectionVisibility = {},
    templateId = "modern",
    typography = { font: "inter", fontSize: "normal", accentColor: "#2563eb", lineHeight: "normal" },
    layoutConfig = { paperFormat: "a4", margins: "normal", showIcons: true },
  } = resume;

  const accentColor = typography.accentColor || "#2563eb";

  // Typography font class
  const fontClass =
    typography.font === "serif" || templateId === "editorial-luxury" || templateId === "executive"
      ? "font-serif"
      : typography.font === "mono" || templateId === "technical"
      ? "font-mono"
      : "font-sans";

  // Margins class
  const paddingClass =
    templateId === "swiss-sidebar"
      ? "p-0" // Sidebar template manages its own internal padding
      : layoutConfig.margins === "compact"
      ? "p-6"
      : layoutConfig.margins === "spacious"
      ? "p-12"
      : "p-8";

  // Font size scale
  const sizeClasses = {
    compact: {
      name: "text-2xl",
      title: "text-xs",
      sectionHeading: "text-xs font-bold tracking-wider",
      itemTitle: "text-xs font-semibold",
      itemSub: "text-[11px]",
      body: "text-[11px] leading-relaxed",
      bullet: "text-[11px] leading-normal",
    },
    normal: {
      name: "text-3xl",
      title: "text-sm",
      sectionHeading: "text-sm font-bold tracking-wider",
      itemTitle: "text-sm font-semibold",
      itemSub: "text-xs",
      body: "text-xs leading-relaxed",
      bullet: "text-xs leading-relaxed",
    },
    spacious: {
      name: "text-4xl",
      title: "text-base",
      sectionHeading: "text-base font-bold tracking-wider",
      itemTitle: "text-base font-semibold",
      itemSub: "text-sm",
      body: "text-sm leading-relaxed",
      bullet: "text-sm leading-relaxed",
    },
  }[typography.fontSize || "normal"];

  const paperClass = layoutConfig.paperFormat === "letter" ? "page-letter" : "page-a4";
  const isVisible = (key: string) => sectionVisibility[key] !== false;

  const getInitials = (name?: string) => {
    if (!name) return "CV";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Section Heading Formatter based on Template
  const renderSectionHeading = (title: string, sectionIndex?: number) => {
    if (templateId === "minimal") {
      return (
        <h2 className={`${sizeClasses.sectionHeading} uppercase text-slate-900 mb-2 border-b border-slate-300 pb-0.5`}>
          {title}
        </h2>
      );
    }

    if (templateId === "editorial-luxury") {
      const idxStr = sectionIndex ? String(sectionIndex).padStart(2, "0") : "01";
      return (
        <div className="mb-2.5">
          <div className="flex items-baseline justify-between border-b border-stone-300 pb-1">
            <h2
              className={`${sizeClasses.sectionHeading} font-serif tracking-[0.18em] uppercase text-stone-900 font-bold`}
            >
              <span className="text-xs font-mono font-normal mr-2" style={{ color: accentColor }}>
                {idxStr} /
              </span>
              {title}
            </h2>
          </div>
        </div>
      );
    }

    if (templateId === "nordic-clean") {
      return (
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-xs" style={{ backgroundColor: accentColor }} />
          <h2 className={`${sizeClasses.sectionHeading} font-sans uppercase tracking-widest text-slate-900 font-bold`}>
            {title}
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      );
    }

    if (templateId === "executive") {
      return (
        <div className="mb-2">
          <h2
            className={`${sizeClasses.sectionHeading} font-serif tracking-widest uppercase pb-1`}
            style={{ color: accentColor }}
          >
            {title}
          </h2>
          <div className="h-[2px] w-full" style={{ backgroundColor: accentColor }} />
        </div>
      );
    }

    if (templateId === "technical") {
      return (
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            # {title}
          </span>
          <div className="h-[1px] flex-1 bg-slate-200" />
        </div>
      );
    }

    if (templateId === "creative") {
      return (
        <h2
          className={`${sizeClasses.sectionHeading} uppercase mb-2 font-bold flex items-center gap-2`}
          style={{ color: accentColor }}
        >
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
          {title}
        </h2>
      );
    }

    if (templateId === "swiss-sidebar") {
      return (
        <h2
          className={`${sizeClasses.sectionHeading} uppercase mb-2 pb-0.5 font-bold tracking-wider border-b`}
          style={{ borderColor: `${accentColor}33`, color: accentColor }}
        >
          {title}
        </h2>
      );
    }

    // Default: Modern Standard
    return (
      <h2
        className={`${sizeClasses.sectionHeading} uppercase mb-2 border-b-2 pb-0.5 font-bold`}
        style={{ borderColor: accentColor, color: accentColor }}
      >
        {title}
      </h2>
    );
  };

  // -----------------------------------------------------------
  // Sub-renderers for each section
  // -----------------------------------------------------------
  const renderSummary = (customIndex?: number) => {
    if (!summary || !isVisible("summary")) return null;
    return (
      <div key="summary" className="mb-4">
        {renderSectionHeading("Professional Summary", customIndex || 1)}
        <p className={`${sizeClasses.body} text-slate-700 leading-relaxed text-justify ${
          templateId === "editorial-luxury" ? "font-serif italic text-stone-800" : ""
        }`}>
          {summary}
        </p>
      </div>
    );
  };

  const renderExperience = (customIndex?: number) => {
    if (experience.length === 0 || !isVisible("experience")) return null;
    const isTimeline = templateId === "swiss-sidebar" || templateId === "technical";

    return (
      <div key="experience" className="mb-4">
        {renderSectionHeading("Work Experience", customIndex || 2)}
        <div className={`space-y-3.5 ${isTimeline ? "border-l-2 ml-2 pl-4 space-y-4" : ""}`} style={isTimeline ? { borderColor: `${accentColor}33` } : undefined}>
          {experience.map((exp) => (
            <div key={exp.id} className="relative">
              {isTimeline && (
                <div
                  className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-white"
                  style={{ borderColor: accentColor }}
                />
              )}
              <div className="flex justify-between items-baseline">
                <span className={`${sizeClasses.itemTitle} text-slate-900`}>
                  {exp.role} <span className="font-normal text-slate-600">— {exp.company}</span>
                </span>
                <span className={`${sizeClasses.itemSub} text-slate-500 whitespace-nowrap font-medium`}>
                  {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              {exp.location && (
                <div className={`${sizeClasses.itemSub} text-slate-500 italic mb-1`}>
                  {exp.location}
                </div>
              )}
              {exp.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-1 mt-1 text-slate-700">
                  {exp.bullets.filter(Boolean).map((bullet, idx) => (
                    <li key={idx} className={sizeClasses.bullet}>
                      {bullet.replace(/^[-*•]\s*/, "")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = (customIndex?: number) => {
    if (education.length === 0 || !isVisible("education")) return null;
    return (
      <div key="education" className="mb-4">
        {renderSectionHeading("Education", customIndex || 3)}
        <div className="space-y-2.5">
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-baseline">
              <div>
                <span className={`${sizeClasses.itemTitle} text-slate-900`}>
                  {edu.degree} in {edu.fieldOfStudy}
                </span>
                <div className={`${sizeClasses.itemSub} text-slate-600`}>
                  {edu.institution} {edu.location ? `• ${edu.location}` : ""} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}
                </div>
              </div>
              <span className={`${sizeClasses.itemSub} text-slate-500 whitespace-nowrap font-medium`}>
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = (customIndex?: number) => {
    if (skills.length === 0 || !isVisible("skills")) return null;
    const isPills = templateId === "swiss-sidebar" || templateId === "nordic-clean" || templateId === "technical";

    return (
      <div key="skills" className="mb-4">
        {renderSectionHeading("Skills & Competencies", customIndex || 4)}
        <div className="space-y-2">
          {skills.map((cat, idx) => (
            <div key={idx} className={isPills ? "space-y-1" : "flex flex-wrap items-baseline gap-1.5"}>
              <span className={`${sizeClasses.itemSub} font-bold text-slate-800 ${isPills ? "block" : "min-w-[130px]"}`}>
                {cat.category}:
              </span>
              {isPills ? (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {cat.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <span className={`${sizeClasses.body} text-slate-700 flex-1`}>
                  {cat.items.join(" • ")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = (customIndex?: number) => {
    if (projects.length === 0 || !isVisible("projects")) return null;
    return (
      <div key="projects" className="mb-4">
        {renderSectionHeading("Key Projects", customIndex || 5)}
        <div className="space-y-3">
          {projects.map((proj) => (
            <div key={proj.id}>
              <div className="flex justify-between items-baseline">
                <span className={`${sizeClasses.itemTitle} text-slate-900 flex items-center gap-1.5`}>
                  {proj.title}
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center text-[10px]"
                    >
                      <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                    </a>
                  )}
                  {proj.role && <span className="font-normal text-slate-500 italic">— {proj.role}</span>}
                </span>
                {proj.techStack?.length > 0 && (
                  <span className={`${sizeClasses.itemSub} text-slate-500 text-right font-medium`}>
                    {proj.techStack.join(", ")}
                  </span>
                )}
              </div>
              {proj.description && (
                <p className={`${sizeClasses.body} text-slate-700 mt-0.5`}>{proj.description}</p>
              )}
              {proj.bullets?.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-0.5 mt-1 text-slate-700">
                  {proj.bullets.filter(Boolean).map((bullet, idx) => (
                    <li key={idx} className={sizeClasses.bullet}>
                      {bullet.replace(/^[-*•]\s*/, "")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = (customIndex?: number) => {
    if (certifications.length === 0 || !isVisible("certifications")) return null;
    return (
      <div key="certifications" className="mb-4">
        {renderSectionHeading("Certifications", customIndex || 6)}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex justify-between text-xs">
              <span className={`${sizeClasses.body} font-medium text-slate-800 truncate`}>
                {cert.name}
              </span>
              <span className={`${sizeClasses.itemSub} text-slate-500 ml-2 whitespace-nowrap`}>
                {cert.issuer} ({cert.issueDate})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAchievements = (customIndex?: number) => {
    if (achievements.length === 0 || !isVisible("achievements")) return null;
    return (
      <div key="achievements" className="mb-4">
        {renderSectionHeading("Key Achievements", customIndex || 7)}
        <div className="space-y-1">
          {achievements.map((ach) => (
            <div key={ach.id} className="flex justify-between text-xs">
              <span className={`${sizeClasses.body} text-slate-800`}>
                <strong>{ach.title}:</strong> {ach.description}
              </span>
              {ach.date && (
                <span className={`${sizeClasses.itemSub} text-slate-500 ml-2 whitespace-nowrap`}>
                  {ach.date}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLanguages = (customIndex?: number) => {
    if (languages.length === 0 || !isVisible("languages")) return null;
    return (
      <div key="languages" className="mb-4">
        {renderSectionHeading("Languages", customIndex || 8)}
        <div className="flex flex-wrap gap-3">
          {languages.map((lang) => (
            <span key={lang.id} className={`${sizeClasses.body} text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded`}>
              <strong>{lang.language}:</strong> {lang.proficiency}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSections = (customIndex?: number) => {
    if (customSections.length === 0 || !isVisible("customSections")) return null;
    return (
      <div key="customSections" className="space-y-4 mb-4">
        {customSections.map((cs) => (
          <div key={cs.id}>
            {renderSectionHeading(cs.heading, customIndex || 9)}
            <div className="space-y-2">
              {cs.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <span className={`${sizeClasses.itemTitle} text-slate-900`}>
                      {item.title} {item.subtitle && <span className="font-normal text-slate-600">— {item.subtitle}</span>}
                    </span>
                    {item.date && (
                      <span className={`${sizeClasses.itemSub} text-slate-500`}>{item.date}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className={`${sizeClasses.body} text-slate-700`}>{item.description}</p>
                  )}
                  {item.bullets && item.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 mt-0.5 text-slate-700">
                      {item.bullets.filter(Boolean).map((b, i) => (
                        <li key={i} className={sizeClasses.bullet}>
                          {b.replace(/^[-*•]\s*/, "")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Ordered sections mapper
  const sectionMap: Record<string, (idx?: number) => React.ReactNode> = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    certifications: renderCertifications,
    achievements: renderAchievements,
    languages: renderLanguages,
    customSections: renderCustomSections,
  };

  const renderContactInfo = (stacked = false) => {
    const showIcons = layoutConfig.showIcons;
    return (
      <div className={`text-xs text-slate-600 ${stacked ? "space-y-1.5" : "flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2"}`}>
        {personalInfo.email && (
          <div className="flex items-center gap-1.5 truncate">
            {showIcons && <Mail className="h-3 w-3 text-slate-400 shrink-0" />}
            <span className="truncate">{personalInfo.email}</span>
          </div>
        )}
        {personalInfo.phone && (
          <div className="flex items-center gap-1.5">
            {showIcons && <Phone className="h-3 w-3 text-slate-400 shrink-0" />}
            <span>{personalInfo.phone}</span>
          </div>
        )}
        {personalInfo.location && (
          <div className="flex items-center gap-1.5">
            {showIcons && <MapPin className="h-3 w-3 text-slate-400 shrink-0" />}
            <span>{personalInfo.location}</span>
          </div>
        )}
        {personalInfo.linkedin && (
          <div className="flex items-center gap-1.5 truncate">
            {showIcons && <LinkedinIcon className="h-3 w-3 text-slate-400 shrink-0" />}
            <span className="truncate">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
          </div>
        )}
        {personalInfo.github && (
          <div className="flex items-center gap-1.5 truncate">
            {showIcons && <GithubIcon className="h-3 w-3 text-slate-400 shrink-0" />}
            <span className="truncate">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
          </div>
        )}
        {personalInfo.website && (
          <div className="flex items-center gap-1.5 truncate">
            {showIcons && <Globe className="h-3 w-3 text-slate-400 shrink-0" />}
            <span className="truncate">{personalInfo.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
          </div>
        )}
      </div>
    );
  };

  // -----------------------------------------------------------
  // LAYOUT 1: PINTEREST TRENDING SWISS SPLIT SIDEBAR
  // -----------------------------------------------------------
  if (templateId === "swiss-sidebar") {
    return (
      <div
        style={{
          transform: printMode ? "none" : `scale(${scale})`,
          transformOrigin: "top center",
        }}
        className="transition-transform duration-100 ease-out"
      >
        <div
          id="resume-canvas"
          className={`bg-white text-slate-900 shadow-xl border border-slate-200 mx-auto ${paperClass} ${fontClass} relative print:border-none print:shadow-none flex flex-row overflow-hidden min-h-[297mm]`}
        >
          {/* Left Tinted Sidebar (33% width) */}
          <div className="w-[33%] bg-slate-50/90 border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 space-y-6">
            <div className="space-y-6">
              {/* Monogram Badge */}
              <div className="text-center sm:text-left flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-xl text-white font-bold flex items-center justify-center text-lg shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  {getInitials(personalInfo.fullName)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {personalInfo.fullName || "Candidate Name"}
                  </h2>
                  <p className="text-[11px] font-medium" style={{ color: accentColor }}>
                    {personalInfo.jobTitle || "Professional"}
                  </p>
                </div>
              </div>

              {/* Sidebar Contact Info */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-0.5">
                  Contact
                </h3>
                {renderContactInfo(true)}
              </div>

              {/* Sidebar Education */}
              {renderEducation()}

              {/* Sidebar Skills Matrix */}
              {renderSkills()}

              {/* Sidebar Languages */}
              {renderLanguages()}

              {/* Sidebar Certifications */}
              {renderCertifications()}
            </div>
          </div>

          {/* Right Main Content Area (67% width) */}
          <div className="flex-1 p-8 space-y-5 bg-white">
            {/* Masthead Header */}
            <div className="border-b border-slate-200 pb-3">
              <h1 className={`${sizeClasses.name} font-extrabold tracking-tight text-slate-900`}>
                {personalInfo.fullName || "Candidate Name"}
              </h1>
              <p className={`${sizeClasses.title} font-medium mt-0.5 tracking-wide`} style={{ color: accentColor }}>
                {personalInfo.jobTitle || "Professional Title"}
              </p>
            </div>

            {/* Main Sections */}
            {renderSummary()}
            {renderExperience()}
            {renderProjects()}
            {renderAchievements()}
            {renderCustomSections()}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------
  // LAYOUT 2: PINTEREST QUIET LUXURY EDITORIAL MAGAZINE
  // -----------------------------------------------------------
  if (templateId === "editorial-luxury") {
    return (
      <div
        style={{
          transform: printMode ? "none" : `scale(${scale})`,
          transformOrigin: "top center",
        }}
        className="transition-transform duration-100 ease-out"
      >
        <div
          id="resume-canvas"
          className={`bg-[#fdfcfb] text-stone-900 shadow-xl border border-stone-200 mx-auto ${paperClass} ${paddingClass} font-serif relative print:border-none print:shadow-none min-h-[297mm]`}
        >
          {/* Haute Editorial Masthead */}
          <div className="text-center pb-4 mb-5 border-b-2 border-stone-800">
            <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-stone-400 block mb-1">
              Curriculum Vitae
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-[0.2em] uppercase text-stone-900">
              {personalInfo.fullName || "Candidate Name"}
            </h1>
            <p className="text-xs font-serif italic text-stone-600 mt-1.5 tracking-widest uppercase">
              {personalInfo.jobTitle || "Professional Title"}
            </p>
            <div className="mt-2.5 pt-2 border-t border-stone-200 font-sans text-[11px] text-stone-500">
              {renderContactInfo()}
            </div>
          </div>

          {/* Ordered Sections */}
          <div className="space-y-4">
            {sectionOrder.map((sectionKey, idx) => {
              const renderer = sectionMap[sectionKey];
              return renderer ? renderer(idx + 1) : null;
            })}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------
  // LAYOUT 3: NORDIC BAUHAUS CLEAN ASYMMETRIC
  // -----------------------------------------------------------
  if (templateId === "nordic-clean") {
    return (
      <div
        style={{
          transform: printMode ? "none" : `scale(${scale})`,
          transformOrigin: "top center",
        }}
        className="transition-transform duration-100 ease-out"
      >
        <div
          id="resume-canvas"
          className={`bg-white text-slate-900 shadow-xl border border-slate-200 mx-auto ${paperClass} ${paddingClass} font-sans relative print:border-none print:shadow-none min-h-[297mm]`}
        >
          {/* Minimalist Nordic Header */}
          <div className="pb-4 mb-5 border-b-2 border-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: accentColor }} />
                  <h1 className={`${sizeClasses.name} font-black tracking-tight text-slate-900`}>
                    {personalInfo.fullName || "Candidate Name"}
                  </h1>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-0.5 ml-5">
                  {personalInfo.jobTitle || "Professional Title"}
                </p>
              </div>
            </div>
            <div className="mt-3 ml-5">
              {renderContactInfo()}
            </div>
          </div>

          {/* Ordered Sections */}
          <div className="space-y-4">
            {sectionOrder.map((sectionKey) => {
              const renderer = sectionMap[sectionKey];
              return renderer ? renderer() : null;
            })}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------
  // STANDARD SINGLE COLUMN TEMPLATES (Modern, Minimal, Executive, Technical, Creative)
  // -----------------------------------------------------------
  return (
    <div
      style={{
        transform: printMode ? "none" : `scale(${scale})`,
        transformOrigin: "top center",
      }}
      className="transition-transform duration-100 ease-out"
    >
      <div
        id="resume-canvas"
        className={`bg-white text-slate-900 shadow-xl border border-slate-200 mx-auto ${paperClass} ${paddingClass} ${fontClass} relative print:border-none print:shadow-none min-h-[297mm]`}
      >
        {/* Template Header Block */}
        {templateId === "creative" ? (
          <div className="border-b-4 pb-4 mb-4" style={{ borderColor: accentColor }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className={`${sizeClasses.name} font-black tracking-tight text-slate-900`}>
                  {personalInfo.fullName || "Candidate Name"}
                </h1>
                <p className={`${sizeClasses.title} font-medium mt-0.5`} style={{ color: accentColor }}>
                  {personalInfo.jobTitle || "Professional Title"}
                </p>
              </div>
            </div>
            <div className="mt-2 text-left">
              {renderContactInfo()}
            </div>
          </div>
        ) : (
          <div className="text-center border-b border-slate-200 pb-3 mb-4">
            <h1
              className={`${sizeClasses.name} font-bold tracking-tight text-slate-900`}
              style={templateId === "executive" ? { color: accentColor } : undefined}
            >
              {personalInfo.fullName || "Candidate Name"}
            </h1>
            {personalInfo.jobTitle && (
              <p className={`${sizeClasses.title} font-medium text-slate-600 mt-0.5`}>
                {personalInfo.jobTitle}
              </p>
            )}
            {renderContactInfo()}
          </div>
        )}

        {/* Dynamic Ordered Sections */}
        <div className="space-y-4">
          {sectionOrder.map((sectionKey) => {
            const renderer = sectionMap[sectionKey];
            return renderer ? renderer() : null;
          })}
        </div>
      </div>
    </div>
  );
}
