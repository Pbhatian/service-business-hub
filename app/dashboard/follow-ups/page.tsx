"use client";

import { useState, useEffect } from "react";
import {
  getFollowUps,
  getClients,
  updateFollowUpStatus,
  insertFollowUp,
} from "@/lib/db";
import type { FollowUpSchedule, Client } from "@/types";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { format, parseISO, differenceInDays, isPast, isToday } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

function urgencyLevel(dateStr: string, status: string) {
  if (status === "completed") return "done";
  if (status === "snoozed") return "snoozed";
  const d = parseISO(dateStr);
  if (isPast(d) && !isToday(d)) return "overdue";
  if (isToday(d)) return "today";
  return "upcoming";
}

type Urgency = "overdue" | "today" | "upcoming" | "snoozed" | "done";

const urgencyConfig: Record<
  Urgency,
  { label: string; bg: string; border: string; color: string; icon: React.ElementType }
> = {
  overdue: {
    label: "Overdue",
    bg: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.3)",
    color: "#fb7185",
    icon: AlertTriangle,
  },
  today: {
    label: "Due Today",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    color: "#fbbf24",
    icon: Clock,
  },
  upcoming: {
    label: "Upcoming",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.3)",
    color: "#a78bfa",
    icon: Bell,
  },
  snoozed: {
    label: "Snoozed",
    bg: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.25)",
    color: "#94a3b8",
    icon: Clock,
  },
  done: {
    label: "Completed",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    color: "#34d399",
    icon: CheckCircle,
  },
};

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUpSchedule[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("all");

  useEffect(() => {
    Promise.all([getFollowUps(), getClients()])
      .then(([fu, cl]) => {
        setItems(fu);
        setClients(cl);
      })
      .finally(() => setLoading(false));
  }, []);

  async function markDone(id: string) {
    try {
      await updateFollowUpStatus(id, "completed");
      setItems((prev) =>
        prev.map((f) => (f.id === id ? { ...f, follow_up_status: "completed" } : f))
      );
      toast.success("Follow-up marked as completed.");
    } catch {
      toast.error("Failed to update follow-up.");
    }
  }

  async function snooze(id: string) {
    try {
      await updateFollowUpStatus(id, "snoozed");
      setItems((prev) =>
        prev.map((f) => (f.id === id ? { ...f, follow_up_status: "snoozed" } : f))
      );
      toast("Follow-up snoozed.");
    } catch {
      toast.error("Failed to snooze follow-up.");
    }
  }

  async function addFollowUp(data: {
    client_id: string;
    reminder_date: string;
    notes: string;
  }) {
    try {
      const newItem = await insertFollowUp({
        client_id: data.client_id,
        reminder_date: data.reminder_date,
        follow_up_status: "pending",
        notes: data.notes,
      });
      setItems((prev) => [newItem, ...prev]);
      toast.success("Follow-up reminder added.");
    } catch {
      toast.error("Failed to add follow-up.");
    }
  }

  const filtered = items.filter((f) => {
    if (filter === "all") return true;
    if (filter === "pending") return f.follow_up_status === "pending";
    if (filter === "completed") return f.follow_up_status === "completed";
    if (filter === "overdue") {
      const u = urgencyLevel(f.reminder_date, f.follow_up_status);
      return u === "overdue";
    }
    return true;
  });

  const counts = {
    all: items.length,
    pending: items.filter((f) => f.follow_up_status === "pending").length,
    overdue: items.filter(
      (f) => urgencyLevel(f.reminder_date, f.follow_up_status) === "overdue"
    ).length,
    completed: items.filter((f) => f.follow_up_status === "completed").length,
  };

  const today = new Date();
  // Only exclude clients who have PENDING or SNOOZED follow-ups (not completed ones)
  const activeFollowUpClientIds = new Set(
    items
      .filter((f) => f.follow_up_status !== "completed")
      .map((f) => f.client_id)
  );
  const needsAttention = clients.filter((c) => {
    if (activeFollowUpClientIds.has(c.id)) return false;
    if (!c.last_contact_date) return true;
    return differenceInDays(today, parseISO(c.last_contact_date)) >= 30;
  });

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles
              className="w-4 h-4 text-violet-400"
              style={{ filter: "drop-shadow(0 0 5px rgba(167,139,250,0.8))" }}
            />
            <span className="text-xs font-medium tracking-widest uppercase text-violet-400/70">
              Follow-Up System
            </span>
          </div>
          <h1 className="text-3xl font-bold gradient-heading mb-1 flex items-center gap-2.5">
            <Bell
              className="w-7 h-7 text-violet-400"
              style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.7))" }}
            />
            Follow-Up Reminders
          </h1>
          <p className="text-slate-400 text-sm">Never miss a client touchpoint again.</p>
        </div>
        <AddFollowUpDialog clients={clients} onAdd={addFollowUp} />
      </div>

      {/* Inactive client alerts */}
      {!loading && needsAttention.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            background: "rgba(244,63,94,0.06)",
            border: "1px solid rgba(244,63,94,0.2)",
          }}
        >
          <p className="text-sm font-semibold mb-2.5 flex items-center gap-2" style={{ color: "#fb7185" }}>
            <AlertTriangle className="w-4 h-4" />
            {needsAttention.length} client{needsAttention.length > 1 ? "s" : ""} not contacted in 30+ days
          </p>
          <div className="flex flex-wrap gap-2">
            {needsAttention.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(244,63,94,0.15)",
                }}
              >
                <span className="text-sm font-medium text-slate-300">{c.name}</span>
                <span className="text-[11px]" style={{ color: "#fb7185" }}>
                  {c.last_contact_date
                    ? `${differenceInDays(today, parseISO(c.last_contact_date))}d inactive`
                    : "Never contacted"}
                </span>
                <Link href={`/dashboard/outreach?client=${c.id}`}>
                  <button
                    className="h-6 text-[10px] px-2.5 rounded-lg font-semibold flex items-center gap-1 transition-all hover:scale-105"
                    style={{
                      background: "rgba(244,63,94,0.2)",
                      border: "1px solid rgba(244,63,94,0.3)",
                      color: "#fb7185",
                    }}
                  >
                    <MessageSquare className="w-2.5 h-2.5" /> Reach out
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "pending", "overdue", "completed"] as const).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200"
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(99,102,241,0.6))",
                      border: "1px solid rgba(139,92,246,0.5)",
                      color: "#fff",
                      boxShadow: "0 0 10px rgba(124,58,237,0.3)",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                    }
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span
                className="ml-1.5 text-[10px] opacity-70"
              >
                ({counts[f]})
              </span>
            </button>
          );
        })}
      </div>

      {/* Follow-up list */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-16 text-slate-400">
            <div
              className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"
              style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}
            />
            <p className="text-sm">Loading follow-ups…</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No follow-ups in this category.</p>
          </div>
        )}
        {filtered.map((fu) => {
          const urgency = urgencyLevel(fu.reminder_date, fu.follow_up_status) as Urgency;
          const cfg = urgencyConfig[urgency];
          const Icon = cfg.icon;
          return (
            <div
              key={fu.id}
              className="glass-card rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5"
                    style={{
                      background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
                      boxShadow: "0 0 8px rgba(109,40,217,0.4)",
                    }}
                  >
                    {fu.client?.name[0] ?? "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-200">
                        {fu.client?.name ?? "Unknown client"}
                      </p>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                      >
                        <Icon className="w-2.5 h-2.5" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{fu.notes}</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Reminder: {format(parseISO(fu.reminder_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {fu.follow_up_status !== "completed" && (
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/dashboard/outreach?client=${fu.client_id}`}>
                      <button
                        className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                        style={{
                          background: "rgba(139,92,246,0.12)",
                          border: "1px solid rgba(139,92,246,0.25)",
                          color: "#a78bfa",
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Reach Out
                      </button>
                    </Link>
                    <button
                      className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-40"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#64748b",
                      }}
                      onClick={() => snooze(fu.id)}
                      disabled={fu.follow_up_status === "snoozed"}
                    >
                      Snooze
                    </button>
                    <button
                      className="h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
                      style={{
                        background: "rgba(16,185,129,0.15)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        color: "#34d399",
                      }}
                      onClick={() => markDone(fu.id)}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddFollowUpDialog({
  clients,
  onAdd,
}: {
  clients: Client[];
  onAdd: (data: { client_id: string; reminder_date: string; notes: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !date) return;
    onAdd({ client_id: clientId, reminder_date: date, notes });
    setOpen(false);
    setClientId("");
    setDate("");
    setNotes("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 0 16px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.3)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          />
        }
      >
        <Plus className="w-4 h-4" /> Add Reminder
      </DialogTrigger>
      <DialogContent
        style={{
          background: "linear-gradient(135deg, rgba(13,11,26,0.99), rgba(10,9,20,0.99))",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 60px rgba(139,92,246,0.1), 0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400" /> Add Follow-Up Reminder
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Client</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="input-dark w-full rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` — ${c.company}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Reminder Date</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-dark w-full rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Notes</label>
            <Textarea
              placeholder="What's the context for this follow-up?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-dark resize-none rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 12px rgba(124,58,237,0.3)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              Add Reminder
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
