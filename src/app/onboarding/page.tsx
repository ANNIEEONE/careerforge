"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Layers, Briefcase, Code, Award } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-level (3-5 years)");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
  ]);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const suggestedSkills = [
    "TypeScript",
    "Python",
    "React",
    "Next.js",
    "Node.js",
    "Go",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "System Design",
    "GraphQL",
    "CI/CD",
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(skillInput.trim())) {
        setSelectedSkills([...selectedSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleFinishOnboarding = async () => {
    setSaving(true);
    try {
      // 1. Update user profile
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetRole,
          onboardingCompleted: true,
        }),
      });

      // 2. Fetch existing starter resume or create one
      const res = await fetch("/api/resumes");
      const data = await res.json();
      const firstResume = data.resumes?.[0];

      if (firstResume) {
        // Update first resume's target role and title
        await fetch(`/api/resumes/${firstResume.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${targetRole} Resume`,
            targetRole,
            skills: [
              {
                category: "Core Technologies",
                items: selectedSkills,
              },
            ],
          }),
        });

        router.push(`/resumes/${firstResume.id}`);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      console.error("Onboarding error:", err);
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-lg mx-auto w-full">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome to CareerForge Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Let&apos;s personalize your initial resume and portfolio in under 60 seconds.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "w-8 bg-blue-600" : "w-2 bg-slate-300"}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "w-8 bg-blue-600" : "w-2 bg-slate-300"}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? "w-8 bg-blue-600" : "w-2 bg-slate-300"}`} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <Briefcase className="h-5 w-5" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  What is your primary target role?
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Our AI assistant uses this to calibrate resume phrasing, summary style, and keyword matching.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "Senior Frontend Engineer",
                  "Full-Stack Software Engineer",
                  "DevOps / Cloud Architect",
                  "Product Manager",
                  "Data Scientist",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTargetRole(s)}
                    className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <Award className="h-5 w-5" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  What is your experience seniority?
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Helps determine the density and hierarchy of work history vs education.
              </p>

              <div className="space-y-2.5">
                {[
                  { level: "Entry-level", years: "0–2 years of experience" },
                  { level: "Mid-level", years: "3–5 years of experience" },
                  { level: "Senior", years: "5–8 years of experience" },
                  { level: "Lead / Principal / Executive", years: "8+ years of experience" },
                ].map((item) => (
                  <div
                    key={item.level}
                    onClick={() => setExperienceLevel(item.level)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      experienceLevel.startsWith(item.level)
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.level}
                      </p>
                      <p className="text-xs text-slate-500">{item.years}</p>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        experienceLevel.startsWith(item.level)
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {experienceLevel.startsWith(item.level) && (
                        <div className="h-1.5 w-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <Code className="h-5 w-5" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Select your top technical skills
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Choose the tools you work with. You can refine, categorize, and add more anytime in the editor.
              </p>

              <div>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="Type a skill and hit Enter..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white mb-2"
                />

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                  {suggestedSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
                <span>Selected: {selectedSkills.join(", ")}</span>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  {saving ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Launch CareerForge Studio
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
