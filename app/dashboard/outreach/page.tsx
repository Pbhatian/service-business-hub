"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getClients, getMessageLogs, insertMessageLog } from "@/lib/db";
import { generateOutreach } from "@/lib/ai-stub";
import type { Client, MessageLog } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Sparkles,
  Copy,
  Save,
  RefreshCw,
  User,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const messageTypes = [
  { value: "re-engagement", label: "Re-Engagement" },
  { value: "check-in", label: "Check-In" },
  { value: "upsell", label: "Upsell / New Service" },
  { value: "referral", label: "Referral Request" },
  { value: "follow-up", label: "Follow-Up" },
];

function OutreachInner() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("client");

  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedClientId, setSelectedClientId] = useState(preselectedId ?? "");
  const [messageType, setMessageType] = useState("check-in");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getClients(), getMessageLogs()])
      .then(([c, l]) => {
        setClients(c);
        setLogs(l);
      })
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (preselectedId) setSelectedClientId(preselectedId);
  }, [preselectedId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  async function handleGenerate() {
    if (!selectedClient) {
      toast.error("Please select a client first.");
      return;
    }
    setLoading(true);
    setSaved(false);
    setDraft("");
    try {
      const result = await generateOutreach(selectedClient, messageType);
      setDraft(result);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft);
    toast.success("Message copied to clipboard!");
  }

  async function handleSave() {
    if (!draft || !selectedClientId) return;
    setSaving(true);
    try {
      const newLog = await insertMessageLog({
        client_id: selectedClientId,
        message_type: messageType as MessageLog["message_type"],
        draft_content: draft,
        sent_status: "draft",
      });
      setLogs((prev) => [{ ...newLog, client: selectedClient }, ...prev]);
      setSaved(true);
      toast.success("Draft saved successfully.");
    } catch {
      toast.error("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles
            className="w-4 h-4 text-violet-400"
            style={{ filter: "drop-shadow(0 0 5px rgba(167,139,250,0.8))" }}
          />
          <span className="text-xs font-medium tracking-widest uppercase text-violet-400/70">
            AI-Powered Outreach
          </span>
        </div>
        <h1 className="text-3xl font-bold gradient-heading mb-1 flex items-center gap-2.5">
          <MessageSquare
            className="w-7 h-7 text-violet-400"
            style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.7))" }}
          />
          AI Outreach
        </h1>
        <p className="text-slate-400 text-sm">
          Generate personalised client messages in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Composer */}
        <div className="lg:col-span-3 space-y-5">
          <div className="glass-card rounded-2xl p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Compose Message
            </p>
            <div className="space-y-4">
              {/* Client selector */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Select Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={loadingData}
                  className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none disabled:opacity-50"
                >
                  <option value="">
                    {loadingData ? "Loading clients…" : "Choose a client…"}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` — ${c.company}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message type */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Message Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {messageTypes.map((mt) => {
                    const active = messageType === mt.value;
                    return (
                      <button
                        key={mt.value}
                        onClick={() => setMessageType(mt.value)}
                        className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200"
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(99,102,241,0.6))",
                                border: "1px solid rgba(139,92,246,0.5)",
                                color: "#fff",
                                boxShadow: "0 0 8px rgba(124,58,237,0.3)",
                              }
                            : {
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#94a3b8",
                              }
                        }
                      >
                        {mt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client context preview */}
              {selectedClient && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(139,92,246,0.06)",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                >
                  <p className="text-[10px] font-semibold text-violet-400/70 mb-1.5 uppercase tracking-wider">
                    Client Context
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedClient.notes || "No notes available."}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedClient.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#64748b",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !selectedClientId || loadingData}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Personalised Message
                  </>
                )}
              </button>

              {/* Draft output */}
              {(draft || loading) && (
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Generated Draft — edit before sending
                  </label>
                  <Textarea
                    value={loading ? "Writing your personalised message…" : draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={12}
                    disabled={loading}
                    className="input-dark text-sm leading-relaxed resize-none rounded-xl"
                  />
                  {!loading && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCopy}
                        className="flex-1 h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saved || saving}
                        className="flex-1 h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-60"
                        style={
                          saved
                            ? {
                                background: "rgba(16,185,129,0.12)",
                                border: "1px solid rgba(16,185,129,0.25)",
                                color: "#34d399",
                              }
                            : {
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#94a3b8",
                              }
                        }
                      >
                        {saved ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Saved
                          </>
                        ) : saving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Save Draft
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="flex-1 h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                        }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved drafts sidebar */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Saved Drafts ({logs.filter((l) => l.sent_status === "draft").length})
            </p>
            <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-dark pr-1">
              {logs
                .filter((l) => l.sent_status === "draft")
                .map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl p-3 cursor-pointer transition-all duration-200 hover:bg-white/[0.03]"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onClick={() => {
                      setSelectedClientId(log.client_id);
                      setDraft(log.draft_content);
                      setMessageType(log.message_type);
                      setSaved(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-600" />
                        <span className="text-xs font-medium text-slate-300">
                          {log.client?.name ??
                            clients.find((c) => c.id === log.client_id)?.name ??
                            "Unknown"}
                        </span>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "rgba(245,158,11,0.12)",
                          border: "1px solid rgba(245,158,11,0.25)",
                          color: "#fbbf24",
                        }}
                      >
                        draft
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {log.draft_content}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1.5">
                      {format(parseISO(log.created_at), "MMM d, yyyy")} · {log.message_type}
                    </p>
                  </div>
                ))}
              {!loadingData &&
                logs.filter((l) => l.sent_status === "draft").length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No drafts yet. Generate your first message!
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense>
      <OutreachInner />
    </Suspense>
  );
}
