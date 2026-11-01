"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Key,
  CreditCard,
  Lock,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"profile" | "ai" | "billing" | "security" | "privacy">("profile");

  // User Profile State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [plan, setPlan] = useState<"FREE" | "PRO">("FREE");
  const [aiCreditsUsed, setAiCreditsUsed] = useState(0);
  const [aiCreditsLimit, setAiCreditsLimit] = useState(15);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "ai", "billing", "security", "privacy"].includes(tab)) {
      setActiveTab(tab as typeof activeTab);
    }

    // Load user data
    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) {
          router.push("/auth/login");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        const u = data.user;
        setName(u.name || "");
        setTitle(u.title || "");
        setEmail(u.email || "");
        setPlan(u.plan || "FREE");
        setAiCreditsUsed(u.aiCreditsUsed || 0);
        setAiCreditsLimit(u.aiCreditsLimit || 15);
        setHasCustomKey(Boolean(u.hasCustomKey));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router, searchParams]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title }),
      });
      if (!res.ok) throw new Error("Failed to update profile.");
      setStatusMessage("Profile details updated successfully.");
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: geminiApiKey.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save API key.");
      setHasCustomKey(Boolean(geminiApiKey.trim()));
      setStatusMessage(
        geminiApiKey.trim()
          ? "Personal Google Gemini API Key configured successfully."
          : "Personal API Key cleared. System will use default key / smart heuristic mode."
      );
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password.");

      setStatusMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTestPlan = async () => {
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const target = plan === "FREE" ? "PRO" : "FREE";
      const res = await fetch("/api/billing/test-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update plan.");

      setPlan(data.plan);
      setStatusMessage(`Account tier updated to ${data.plan} (Server verified).`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you entirely sure you want to permanently delete your account and all documents?")) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account.");

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Account & Studio Settings
        </h1>
        <p className="text-xs text-slate-500 mb-8">
          Manage your identity, API keys, subscription tier, and privacy controls.
        </p>

        {statusMessage && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Settings Sidebar Tabs */}
          <div className="md:col-span-3 space-y-1">
            {[
              { id: "profile", label: "Profile Identity", icon: User },
              { id: "ai", label: "AI & API Keys", icon: Key },
              { id: "billing", label: "Billing & Plans", icon: CreditCard },
              { id: "security", label: "Security", icon: Lock },
              { id: "privacy", label: "Privacy & Data", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setStatusMessage(null);
                    setErrorMessage(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Content Card */}
          <div className="md:col-span-9 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your candidate name and professional title across created documents.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Lead Software Architect"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {saving ? "Saving..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: AI & API KEYS */}
            {activeTab === "ai" && (
              <form onSubmit={handleSaveApiKey} className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    AI Model & API Configuration
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure your personal Google Gemini API key or use CareerForge&apos;s intelligent fallback engine.
                  </p>
                </div>

                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs space-y-1.5 text-blue-800 dark:text-blue-300">
                  <p className="font-semibold">Default Heuristic & Cloud Gemini Support</p>
                  <p className="text-[11px] leading-relaxed">
                    CareerForge is pre-configured with smart rule-based heuristic generation (action verbs, quantifiable metrics, ATS keyword extraction). Supplying your personal Gemini API key activates live Google Gemini 2.5 Flash models for contextual generation.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Google Gemini API Key
                      </label>
                      {hasCustomKey && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                          Active Custom Key
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder={hasCustomKey ? "••••••••••••••••••••••••" : "AIzaSy..."}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Leave blank and save to clear your custom key.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {saving ? "Saving..." : "Save API Configuration"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: BILLING & PLANS */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Subscription & Feature Entitlements
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review your tier limits, upgrade options, and server verification status.
                  </p>
                </div>

                {/* Plan Overview Card */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                      Current Active Plan
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {plan === "PRO" ? "Pro Studio (₹59/mo)" : "Free Starter"}
                      </span>
                      {plan === "PRO" ? (
                        <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full flex items-center gap-1">
                          <Crown className="h-3 w-3 text-amber-500" />
                          PRO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full">
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {plan === "PRO"
                        ? "Unlimited resumes, all 5 ATS templates, and unlimited AI tailoring."
                        : "Limited to 3 resumes, standard templates, and 15 monthly AI credits."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleToggleTestPlan}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {plan === "FREE" ? "Switch to Pro (Test Mode)" : "Switch to Free (Test Mode)"}
                    </button>
                    <span className="text-[10px] text-center text-slate-400">
                      Evaluator Instant Tier Switcher
                    </span>
                  </div>
                </div>

                {/* Entitlement Breakdown */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Feature Comparison
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-semibold block text-slate-900 dark:text-white">Active Resumes</span>
                      <span className="text-slate-500">{plan === "PRO" ? "Unlimited Resumes" : "Up to 3 Resumes"}</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-semibold block text-slate-900 dark:text-white">ATS Templates</span>
                      <span className="text-slate-500">{plan === "PRO" ? "All 5 Templates (Executive, Tech, Creative)" : "Modern & Minimalist"}</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-semibold block text-slate-900 dark:text-white">Job Tailoring & ATS Scans</span>
                      <span className="text-slate-500">{plan === "PRO" ? "Unlimited Scans & Keyword Optimization" : "Preview Scans"}</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="font-semibold block text-slate-900 dark:text-white">Cover Letter Synthesis</span>
                      <span className="text-slate-500">{plan === "PRO" ? "Enabled (Tailored to Job Posting)" : "Pro Only"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Change Password
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your account credentials securely.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {/* TAB: PRIVACY & DATA */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Data Portability & Account Erasure
                  </h2>
                  <p className="text-xs text-slate-500">
                    Download an exhaustive JSON archive of your documents or permanently delete your account.
                  </p>
                </div>

                {/* Data Export Box */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download className="h-4 w-4 text-blue-500" />
                    Download All Personal Data (GDPR Compliant)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Includes all saved resumes, version snapshots, job tailoring scans, portfolios, and account metadata formatted in structured JSON.
                  </p>
                  <a
                    href="/api/user/export-data"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export JSON Archive
                  </a>
                </div>

                {/* Delete Account Box */}
                <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Danger Zone: Delete Account
                    </h3>
                    <p className="text-xs text-red-600/80 dark:text-red-300 mt-1 leading-relaxed">
                      Permanently wipes your account and all associated documents, portfolios, and history. This action cannot be reversed.
                    </p>
                  </div>

                  <form onSubmit={handleDeleteAccount} className="space-y-3 max-w-sm">
                    <div>
                      <label className="block text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                        Confirm with Password
                      </label>
                      <input
                        type="password"
                        required
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Your password"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Permanently Delete Account
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
