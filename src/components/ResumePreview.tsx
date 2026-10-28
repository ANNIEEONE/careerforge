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
    typography.font === "serif"
      ? "font-serif"
      : typography.font === "mono"
      ? "font-mono"
      : "font-sans";

  // Margins class
  const paddingClass =
    layoutConfig.margins === "compact"
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

  // Section visibility check
  const isVisible = (key: string) => sectionVisibility[key] !== false;

  // -----------------------------------------------------------
  // Sub-renderers for each section
  // -----------------------------------------------------------
  const renderSummary = () => {
    if (!summary || !isVisible("summary")) return null;
    return (
      <div key="summary" className="mb-4">
        {renderSectionHeading("Professional Summary")}
        <p className={`${sizeClasses.body} text-slate-700 leading-relaxed text-justify`}>
          {summary}
        </p>
      </div>
    );
  };

  const renderExperience = () => {
    if (experience.length === 0 || !isVisible("experience")) return null;
    return (
      <div key="experience" className="mb-4">
        {renderSectionHeading("Work Experience")}
        <div className="space-y-3">
          {experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline">
                <span className={`${sizeClasses.itemTitle} text-slate-900`}>
                  {exp.role} <span className="font-normal text-slate-600">— {exp.company}</span>
                </span>
                <span className={`${sizeClasses.itemSub} text-slate-500 whitespace-nowrap`}>
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

  const renderEducation = () => {
    if (education.length === 0 || !isVisible("education")) return null;
    return (
      <div key="education" className="mb-4">
        {renderSectionHeading("Education")}
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
              <span className={`${sizeClasses.itemSub} text-slate-500 whitespace-nowrap`}>
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (skills.length === 0 || !isVisible("skills")) return null;
    return (
      <div key="skills" className="mb-4">
        {renderSectionHeading("Skills & Competencies")}
        <div className="space-y-1.5">
          {skills.map((cat, idx) => (
            <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
              <span className={`${sizeClasses.itemSub} font-bold text-slate-800 min-w-[130px]`}>
                {cat.category}:
              </span>
              <span className={`${sizeClasses.body} text-slate-700 flex-1`}>
                {cat.items.join(" • ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (projects.length === 0 || !isVisible("projects")) return null;
    return (
      <div key="projects" className="mb-4">
        {renderSectionHeading("Key Projects")}
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
                  <span className={`${sizeClasses.itemSub} text-slate-500 text-right`}>
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

  const renderCertifications = () => {
    if (certifications.length === 0 || !isVisible("certifications")) return null;
    return (
      <div key="certifications" className="mb-4">
        {renderSectionHeading("Certifications")}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
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

  const renderAchievements = () => {
    if (achievements.length === 0 || !isVisible("achievements")) return null;
    return (
      <div key="achievements" className="mb-4">
        {renderSectionHeading("Key Achievements")}
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

  const renderLanguages = () => {
    if (languages.length === 0 || !isVisible("languages")) return null;
    return (
      <div key="languages" className="mb-4">
        {renderSectionHeading("Languages")}
        <div className="flex flex-wrap gap-4">
          {languages.map((lang) => (
            <span key={lang.id} className={`${sizeClasses.body} text-slate-700`}>
              <strong>{lang.language}:</strong> {lang.proficiency}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSections = () => {
    if (customSections.length === 0 || !isVisible("customSections")) return null;
    return (
      <div key="customSections" className="space-y-4 mb-4">
        {customSections.map((cs) => (
          <div key={cs.id}>
            {renderSectionHeading(cs.heading)}
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

  // Section Heading Formatter based on Template
  const renderSectionHeading = (title: string) => {
    if (templateId === "minimal") {
      return (
        <h2 className={`${sizeClasses.sectionHeading} uppercase text-slate-900 mb-2 border-b border-slate-300 pb-0.5`}>
          {title}
        </h2>
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
          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 uppercase tracking-wider">
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
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
          {title}
        </h2>
      );
    }
    // Default: Modern
    return (
      <h2
        className={`${sizeClasses.sectionHeading} uppercase mb-2 border-b-2 pb-0.5 font-bold`}
        style={{ borderColor: accentColor, color: accentColor }}
      >
        {title}
      </h2>
    );
  };

  // Ordered sections mapper
  const sectionMap: Record<string, () => React.ReactNode> = {
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

  // -----------------------------------------------------------
  // Contact details line renderer
  // -----------------------------------------------------------
  const renderContactInfo = () => {
    const showIcons = layoutConfig.showIcons;
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
        {personalInfo.email && (
          <span className="flex items-center gap-1">
            {showIcons && <Mail className="h-3 w-3 text-slate-400" />}
            {personalInfo.email}
          </span>
        )}
        {personalInfo.phone && (
          <span className="flex items-center gap-1">
            {showIcons && <Phone className="h-3 w-3 text-slate-400" />}
            {personalInfo.phone}
          </span>
        )}
        {personalInfo.location && (
          <span className="flex items-center gap-1">
            {showIcons && <MapPin className="h-3 w-3 text-slate-400" />}
            {personalInfo.location}
          </span>
        )}
        {personalInfo.linkedin && (
          <span className="flex items-center gap-1">
            {showIcons && <LinkedinIcon className="h-3 w-3 text-slate-400" />}
            {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
          </span>
        )}
        {personalInfo.github && (
          <span className="flex items-center gap-1">
            {showIcons && <GithubIcon className="h-3 w-3 text-slate-400" />}
            {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
          </span>
        )}
        {personalInfo.website && (
          <span className="flex items-center gap-1">
            {showIcons && <Globe className="h-3 w-3 text-slate-400" />}
            {personalInfo.website.replace(/^https?:\/\/(www\.)?/, "")}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        transform: printMode ? "none" : `scale(${scale})`,
        transformOrigin: "top center",
      }}
      className={`transition-transform duration-100 ease-out`}
    >
      <div
        id="resume-canvas"
        className={`bg-white text-slate-900 shadow-xl border border-slate-200 mx-auto ${paperClass} ${paddingClass} ${fontClass} relative print:border-none print:shadow-none`}
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
