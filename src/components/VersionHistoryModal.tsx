"use client";

import { useEffect, useState } from "react";
import { X, History, RotateCcw, Plus, Clock, Check } from "lucide-react";

interface VersionItem {
  id: string;
  versionNumber: number;
  changeSummary: string;
  createdAt: string;
}

interface VersionHistoryModalProps {
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: () => void;
}

export default function VersionHistoryModal({
  resumeId,
  isOpen,
  onClose,
  onRestoreComplete,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [manualNote, setManualNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/resumes/${resumeId}/versions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.versions) setVersions(data.versions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resumeId, isOpen]);

  if (!isOpen) return null;

  const handleCreateSnapshot = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeSummary: manualNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkpoint");
      setVersions([data.version, ...versions]);
      setManualNote("");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this version? Any unsaved edits will be superseded.")) {
      return;
    }
    setRestoringId(versionId);
    setError(null);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions/${versionId}/restore`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to restore version");
      }
      onRestoreComplete();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Version History & Checkpoints
              </h2>
              <p className="text-xs text-slate-500">
                View previous snapshots and restore your resume to an earlier state at any time.
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

        {/* Create Manual Checkpoint */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            placeholder="Label this checkpoint (e.g., 'Targeting Meta Lead Role')"
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateSnapshot}
            disabled={creating}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            {creating ? "Saving..." : "Save Checkpoint"}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-slate-400">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading version history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No saved versions yet. Checkpoints are automatically recorded as you edit.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {versions.map((ver, idx) => (
                <div
                  key={ver.id}
                  className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Version #{ver.versionNumber}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{ver.changeSummary}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(ver.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRestore(ver.id)}
                    disabled={restoringId === ver.id}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {restoringId === ver.id ? (
                      <div className="h-3 w-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
