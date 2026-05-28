"use client";

import { useState } from "react";
import { mockFollowUps, mockClients } from "@/lib/mock-data";
import type { FollowUpSchedule, Client } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  MessageSquare,
  Timer,
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

const urgencyConfig = {
  overdue: { label: "Overdue", color: "bg-rose-50 text-rose-600", icon: AlertTriangle },
  today: { label: "Due Today", color: "bg-amber-50 text-amber-600", icon: Clock },
  upcoming: { label: "Upcoming", color: "bg-violet-50 text-violet-600", icon: Bell },
  snoozed: { label: "Snoozed", color: "bg-slate-100 text-slate-500", icon: Clock },
  done: { label: "Completed", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
};

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUpSchedule[]>(mockFollowUps);
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("all");

  function markDone(id: string) {
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, follow_up_status: "completed" } : f))
    );
    toast.success("Follow-up marked as completed.");
  }

  function snooze(id: string) {
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, follow_up_status: "snoozed" } : f))
    );
    toast("Follow-up snoozed for 7 days.");
  }

  function addFollowUp(data: { client_id: string; reminder_date: string; notes: string }) {
    const client = mockClients.find((c) => c.id === data.client_id);
    const newItem: FollowUpSchedule = {
      id: `f${Date.now()}`,
      client_id: data.client_id,
      reminder_date: data.reminder_date,
      follow_up_status: "pending",
      notes: data.notes,
      created_at: new Date().toISOString().split("T")[0],
      client,
    };
    setItems((prev) => [newItem, ...prev]);
    toast.success("Follow-up reminder added.");
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
    overdue: items.filter((f) => urgencyLevel(f.reminder_date, f.follow_up_status) === "overdue").length,
    completed: items.filter((f) => f.follow_up_status === "completed").length,
  };

  // Detect inactive clients not already in follow-ups
  const followUpClientIds = new Set(items.map((f) => f.client_id));
  const needsAttention = mockClients.filter((c) => {
    if (followUpClientIds.has(c.id)) return false;
    if (!c.last_contact_date) return true;
    return differenceInDays(new Date("2026-05-28"), parseISO(c.last_contact_date)) >= 30;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-violet-600" /> Follow-Up Reminders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Never miss a client touchpoint again.
          </p>
        </div>
        <AddFollowUpDialog clients={mockClients} onAdd={addFollowUp} />
      </div>

      {/* Inactive client alerts */}
      {needsAttention.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-rose-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {needsAttention.length} client{needsAttention.length > 1 ? "s" : ""} not contacted in 30+ days
          </p>
          <div className="flex flex-wrap gap-2">
            {needsAttention.map((c) => (
              <div key={c.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-rose-100">
                <span className="text-sm font-medium text-slate-800">{c.name}</span>
                <span className="text-[11px] text-rose-500">
                  {c.last_contact_date
                    ? `${differenceInDays(new Date("2026-05-28"), parseISO(c.last_contact_date))}d inactive`
                    : "Never contacted"}
                </span>
                <Link href={`/dashboard/outreach?client=${c.id}`}>
                  <Button size="sm" className="h-6 text-[10px] px-2 bg-rose-500 hover:bg-rose-600 ml-1">
                    <MessageSquare className="w-3 h-3 mr-1" /> Reach out
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "pending", "overdue", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              filter === f
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`ml-1.5 rounded-full px-1.5 text-[10px] ${filter === f ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Follow-up list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No follow-ups in this category.</p>
          </div>
        )}
        {filtered.map((fu) => {
          const urgency = urgencyLevel(fu.reminder_date, fu.follow_up_status);
          const cfg = urgencyConfig[urgency];
          const Icon = cfg.icon;
          return (
            <Card key={fu.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                      {fu.client?.name[0] ?? "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-800">
                          {fu.client?.name ?? "Unknown client"}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                          <Icon className="w-2.5 h-2.5" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{fu.notes}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Reminder: {format(parseISO(fu.reminder_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  {fu.follow_up_status !== "completed" && (
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/dashboard/outreach?client=${fu.client_id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs border-violet-200 text-violet-600 hover:bg-violet-50">
                          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Reach Out
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => snooze(fu.id)}
                        disabled={fu.follow_up_status === "snoozed"}
                      >
                        Snooze
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => markDone(fu.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Done
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
      <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700" />}>
        <Plus className="w-4 h-4 mr-2" /> Add Reminder
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Follow-Up Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Client</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Reminder Date</label>
            <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Notes</label>
            <Textarea
              placeholder="What's the context for this follow-up?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Add Reminder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
