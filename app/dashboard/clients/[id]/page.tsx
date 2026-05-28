"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getClientById,
  getMessageLogsByClientId,
  getFollowUpsByClientId,
} from "@/lib/db";
import type { Client, MessageLog, FollowUpSchedule, ClientTag } from "@/types";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Clock,
  MessageSquare,
  Bell,
  Tag,
  FileText,
  Sparkles,
  User,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

const tagStyles: Record<ClientTag, { bg: string; border: string; color: string }> = {
  "high-value": { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", color: "#fbbf24" },
  new: { bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.3)", color: "#38bdf8" },
  inactive: { bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.3)", color: "#fb7185" },
  vip: { bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.35)", color: "#c4b5fd" },
  referral: { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.3)", color: "#2dd4bf" },
  "follow-up": { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", color: "#fb923c" },
  prospect: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", color: "#60a5fa" },
  active: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", color: "#34d399" },
  churned: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", color: "#94a3b8" },
};

export default function ClientProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getClientById(id),
      getMessageLogsByClientId(id),
      getFollowUpsByClientId(id),
    ])
      .then(([c, msgs, fus]) => {
        if (!c) {
          setNotFoundState(true);
        } else {
          setClient(c);
          setMessages(msgs);
          setFollowUps(fus);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center py-20 text-slate-400">
        <div
          className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}
        />
        <p className="text-sm">Loading client profile…</p>
      </div>
    );
  }

  if (notFoundState || !client) {
    return (
      <div className="p-8 text-center py-20 text-slate-400">
        <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-semibold text-slate-400">Client not found</p>
        <Link href="/dashboard/clients">
          <button
            className="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
            }}
          >
            ← Back to Clients
          </button>
        </Link>
      </div>
    );
  }

  const days = client.last_contact_date
    ? differenceInDays(new Date(), parseISO(client.last_contact_date))
    : null;

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link href="/dashboard/clients">
        <button
          className="flex items-center gap-1.5 mb-6 text-sm text-slate-500 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: "0 0 24px rgba(124,58,237,0.5), 0 0 48px rgba(124,58,237,0.2)",
            }}
          >
            {client.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles
                className="w-3.5 h-3.5 text-violet-400"
                style={{ filter: "drop-shadow(0 0 4px rgba(167,139,250,0.8))" }}
              />
              <span className="text-[10px] font-medium tracking-widest uppercase text-violet-400/70">
                Client Profile
              </span>
            </div>
            <h1 className="text-2xl font-bold gradient-heading">{client.name}</h1>
            {client.company && (
              <p className="text-slate-500 text-sm">{client.company}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {client.tags.map((tag) => {
                const s = tagStyles[tag] ?? {
                  bg: "rgba(100,116,139,0.1)",
                  border: "rgba(100,116,139,0.25)",
                  color: "#94a3b8",
                };
                return (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      color: s.color,
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <Link href={`/dashboard/outreach?client=${id}`}>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 0 16px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.3)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          >
            <MessageSquare className="w-4 h-4" /> Generate Outreach
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Contact info */}
        <div className="glass-card rounded-2xl p-5 md:col-span-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-violet-400" /> Contact Details
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-slate-600 shrink-0" />
              <a href={`mailto:${client.email}`} className="hover:text-violet-400 transition-colors">
                {client.email}
              </a>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                {client.phone}
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Building className="w-4 h-4 text-slate-600 shrink-0" />
                {client.company}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-slate-600 shrink-0" />
              {days !== null
                ? `Last contacted ${days === 0 ? "today" : `${days} days ago`} (${format(
                    parseISO(client.last_contact_date!),
                    "MMM d, yyyy"
                  )})`
                : "No contact recorded"}
            </div>
            {client.service_type && (
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Tag className="w-4 h-4 text-slate-600 shrink-0" />
                {client.service_type}
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Summary
          </p>
          <div className="space-y-4">
            {[
              { label: "Messages", value: messages.length, icon: MessageSquare },
              { label: "Follow-Ups", value: followUps.length, icon: Bell },
              {
                label: "Client Since",
                value: format(parseISO(client.created_at), "MMM yyyy"),
                icon: Clock,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Icon className="w-3.5 h-3.5 text-violet-400/70" /> {label}
                </div>
                <span className="text-sm font-semibold text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="glass-card rounded-2xl p-5 mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-violet-400/70" /> Notes
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          {client.notes || "No notes added yet."}
        </p>
      </div>

      {/* Message history */}
      {messages.length > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400/70" /> Message History
          </p>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold capitalize"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "#a78bfa",
                    }}
                  >
                    {msg.message_type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={
                        msg.sent_status === "sent"
                          ? { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }
                          : { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }
                      }
                    >
                      {msg.sent_status}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {format(parseISO(msg.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 whitespace-pre-line line-clamp-3 leading-relaxed">
                  {msg.draft_content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-ups */}
      {followUps.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-violet-400/70" /> Follow-Ups
          </p>
          <div className="space-y-3">
            {followUps.map((fu) => (
              <div
                key={fu.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <p className="text-sm text-slate-300">{fu.notes}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(parseISO(fu.reminder_date), "MMMM d, yyyy")}
                  </p>
                </div>
                <span
                  className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={
                    fu.follow_up_status === "completed"
                      ? { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }
                      : fu.follow_up_status === "snoozed"
                      ? { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }
                      : { background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }
                  }
                >
                  {fu.follow_up_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
