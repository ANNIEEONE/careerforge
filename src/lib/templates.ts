import { TemplateId } from "./types";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  isPro: boolean;
  accentColor: string;
  category: "ATS Standard" | "Modern Tech" | "Executive" | "Creative" | "Pinterest Luxury";
  recommendedFor: string;
  tag?: string;
}

export const RESUME_TEMPLATES: TemplateDefinition[] = [
  {
    id: "modern",
    name: "Modern Standard",
    description: "Balanced, clean sans-serif layout with sleek horizontal accents. Highest ATS compatibility score.",
    isPro: false,
    accentColor: "#2563eb",
    category: "ATS Standard",
    recommendedFor: "Software Engineers, Product Managers, General Professionals",
  },
  {
    id: "minimal",
    name: "Minimalist Slate",
    description: "High-contrast editorial typography with pure whitespace balance and unobtrusive borders.",
    isPro: false,
    accentColor: "#0f172a",
    category: "ATS Standard",
    recommendedFor: "Academics, Researchers, Data Scientists, Minimalists",
  },
  {
    id: "swiss-sidebar",
    name: "Swiss Split Sidebar",
    description: "Pinterest #1 Trending: Elegant two-column layout with monogram badge, tinted contact/skill rail, and experience timeline nodes.",
    isPro: true,
    accentColor: "#1e3a8a",
    category: "Pinterest Luxury",
    recommendedFor: "Senior Developers, Tech Leads, Engineering Managers & Product Designers",
    tag: "Trending",
  },
  {
    id: "editorial-luxury",
    name: "Quiet Luxury Editorial",
    description: "High-fashion magazine layout with Roman serif headings, numbered section indices (01/SUMMARY), and refined double hairlines.",
    isPro: true,
    accentColor: "#44403c",
    category: "Pinterest Luxury",
    recommendedFor: "Executives, Architects, Consultants, Strategists & Creative Directors",
    tag: "Most Pinned",
  },
  {
    id: "executive",
    name: "Ivy League Executive",
    description: "Prestigious Harvard/Wall Street layout with classical serif typography, refined double rules, and distinguished corporate hierarchy.",
    isPro: true,
    accentColor: "#047857",
    category: "Executive",
    recommendedFor: "Directors, VPs, C-Suite, Legal, Investment Banking & Advisory",
  },
  {
    id: "technical",
    name: "Silicon Tech Matrix",
    description: "Dense, high-information layout with monospace badges, categorized tool matrix, and bullet metric emphasis.",
    isPro: true,
    accentColor: "#4f46e5",
    category: "Modern Tech",
    recommendedFor: "DevOps, Cloud Architects, Backend Engineers, Cybersecurity",
  },
  {
    id: "nordic-clean",
    name: "Nordic Bauhaus",
    description: "Stockholm-inspired asymmetrical clean architecture with offset color accents, modular skill containers, and high whitespace balance.",
    isPro: true,
    accentColor: "#0d9488",
    category: "Pinterest Luxury",
    recommendedFor: "Full-Stack Developers, UI/UX Engineers & Startup Founders",
    tag: "New",
  },
  {
    id: "creative",
    name: "Modern Studio",
    description: "Vibrant visual hierarchy with dynamic top banners, styled tags, and modern project feature blocks.",
    isPro: true,
    accentColor: "#d97706",
    category: "Creative",
    recommendedFor: "UI/UX Designers, Creative Directors, Founders, Marketers",
  },
];

export const ACCENT_COLORS = [
  { name: "Sapphire Blue", value: "#2563eb" },
  { name: "Oxford Navy", value: "#1e3a8a" },
  { name: "Slate Charcoal", value: "#1e293b" },
  { name: "Quiet Taupe", value: "#57534e" },
  { name: "Sage Olive", value: "#3f6212" },
  { name: "Emerald Forest", value: "#047857" },
  { name: "Royal Indigo", value: "#4f46e5" },
  { name: "Bordeaux Wine", value: "#881337" },
  { name: "Crimson Rose", value: "#e11d48" },
  { name: "Amber Ochre", value: "#d97706" },
  { name: "Nordic Teal", value: "#0d9488" },
];
