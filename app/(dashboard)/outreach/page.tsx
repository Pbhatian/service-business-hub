"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getClients, getMessageLogs, insertMessageLog } from "@/lib/db";
import { generateOutreach } from "@/lib/ai-stub";
import type { Client, MessageLog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      .then(([c, l]) => { setClients(c); setLogs(l); })
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-violet-600" /> AI Outreach
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate personalised client messages in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Composer */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" /> Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client selector */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Select Client
                </label>
                <Select value={selectedClientId} onValueChange={(v) => setSelectedClientId(v ?? "")}>
                  <SelectTrigger className="bg-white border-slate-200 w-full">
                    <span className="flex flex-1 text-left text-sm truncate">
                      {selectedClient
                        ? `${selectedClient.name}${selectedClient.company ? ` — ${selectedClient.company}` : ""}`
                        : loadingData ? "Loading clients…" : "Choose a client…"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.company ? ` — ${c.company}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message type */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Message Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {messageTypes.map((mt) => (
                    <button
                      key={mt.value}
                      onClick={() => setMessageType(mt.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                        messageType === mt.value
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client context preview */}
              {selectedClient && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Client Context
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedClient.notes || "No notes available."}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedClient.tags.map((t) => (
                      <span key={t} className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedClientId || loadingData}
                className="w-full bg-violet-600 hover:bg-violet-700 h-11"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Generate Personalised Message
                  </>
                )}
              </Button>

              {/* Draft output */}
              {(draft || loading) && (
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Generated Draft — edit before sending
                  </label>
                  <Textarea
                    value={loading ? "Writing your personalised message…" : draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={12}
                    disabled={loading}
                    className="text-sm leading-relaxed resize-none bg-white border-slate-200"
                  />
                  {!loading && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1">
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSave}
                        disabled={saved || saving}
                        className={`flex-1 ${saved ? "text-emerald-600 border-emerald-200" : ""}`}
                      >
                        {saved ? (
                          <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Saved</>
                        ) : saving ? (
                          <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving…</>
                        ) : (
                          <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft</>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleGenerate} className="flex-1">
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Saved drafts sidebar */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Saved Drafts ({logs.filter((l) => l.sent_status === "draft").length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {logs.filter((l) => l.sent_status === "draft").map((log) => (
                <div
                  key={log.id}
                  className="border border-slate-100 rounded-xl p-3 bg-slate-50 cursor-pointer hover:border-violet-200 transition-colors"
                  onClick={() => {
                    setSelectedClientId(log.client_id);
                    setDraft(log.draft_content);
                    setMessageType(log.message_type);
                    setSaved(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-medium text-slate-700">
                        {log.client?.name ?? clients.find((c) => c.id === log.client_id)?.name ?? "Unknown"}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-600 border-0">
                      draft
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {log.draft_content}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {format(parseISO(log.created_at), "MMM d, yyyy")} · {log.message_type}
                  </p>
                </div>
              ))}
              {!loadingData && logs.filter((l) => l.sent_status === "draft").length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  No drafts yet. Generate your first message!
                </p>
              )}
            </CardContent>
          </Card>
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
