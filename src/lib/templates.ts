import { TemplateId } from "./types";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  isPro: boolean;
  accentColor: string;
  category: "ATS Standard" | "Modern Tech" | "Executive" | "Creative";
  recommendedFor: string;
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
    id: "executive",
    name: "Executive Serif",
    description: "Prestigious layout with classic serif typography, refined double rules, and distinguished hierarchy.",
    isPro: true,
    accentColor: "#047857",
    category: "Executive",
    recommendedFor: "Directors, VPs, C-Suite, Legal, Finance & Consulting",
  },
  {
    id: "technical",
    name: "Tech Matrix",
    description: "Dense, high-information layout with monospace badges, categorized tool matrix, and bullet emphasis.",
    isPro: true,
    accentColor: "#4f46e5",
    category: "Modern Tech",
    recommendedFor: "DevOps, Cloud Architects, Backend Engineers, Cybersecurity",
  },
  {
    id: "creative",
    name: "Creative Studio",
    description: "Sophisticated dual-column format with side contact/skill rail and rich visual hierarchy.",
    isPro: true,
    accentColor: "#d97706",
    category: "Creative",
    recommendedFor: "UI/UX Designers, Creative Directors, Founders, Marketers",
  },
];

export const ACCENT_COLORS = [
  { name: "Sapphire Blue", value: "#2563eb" },
  { name: "Slate Charcoal", value: "#1e293b" },
  { name: "Emerald Forest", value: "#059669" },
  { name: "Royal Indigo", value: "#4f46e5" },
  { name: "Crimson Rose", value: "#e11d48" },
  { name: "Amber Ochre", value: "#d97706" },
  { name: "Teal Cyan", value: "#0d9488" },
];
