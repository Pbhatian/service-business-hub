"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getClients } from "@/lib/db";
import type { Client, ClientTag } from "@/types";
import {
  Search,
  Users,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { AddClientDialog } from "@/components/clients/add-client-dialog";

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

const filterTags = ["all", "active", "inactive", "vip", "new", "follow-up"] as const;
type FilterTag = (typeof filterTags)[number];

function daysSinceContact(client: Client) {
  if (!client.last_contact_date) return null;
  return differenceInDays(new Date(), parseISO(client.last_contact_date));
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<FilterTag>("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === "all" || c.tags.includes(filterTag as ClientTag);
    return matchSearch && matchTag;
  });

  const tagCounts: Partial<Record<ClientTag, number>> = {};
  clients.forEach((c) =>
    c.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] ?? 0) + 1))
  );

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles
              className="w-4 h-4 text-violet-400"
              style={{ filter: "drop-shadow(0 0 5px rgba(167,139,250,0.8))" }}
            />
            <span className="text-xs font-medium tracking-widest uppercase text-violet-400/70">
              Client Management
            </span>
          </div>
          <h1 className="text-3xl font-bold gradient-heading mb-1 flex items-center gap-2.5">
            <Users
              className="w-7 h-7 text-violet-400"
              style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.7))" }}
            />
            Clients
          </h1>
          <p className="text-slate-400 text-sm">
            <span className="text-slate-300 font-medium">{clients.length}</span> total ·{" "}
            <span className="text-emerald-400 font-medium">
              {clients.filter((c) => c.tags.includes("active")).length}
            </span>{" "}
            active
          </p>
        </div>
        <AddClientDialog onAdd={(c) => setClients((prev) => [c, ...prev])} />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-dark w-full pl-9 pr-4 h-10 rounded-xl text-sm outline-none"
            placeholder="Search clients by name, email or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterTags.map((tag) => {
            const active = filterTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className="text-xs h-9 px-3.5 rounded-xl font-medium transition-all duration-200"
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(99,102,241,0.6))",
                        border: "1px solid rgba(139,92,246,0.5)",
                        color: "#fff",
                        boxShadow: "0 0 12px rgba(124,58,237,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#94a3b8",
                      }
                }
              >
                {tag === "all" ? "All" : tag}
                {tag !== "all" && tagCounts[tag as ClientTag] ? (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    ({tagCounts[tag as ClientTag]})
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div
            className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}
          />
          <p className="text-sm">Loading clients…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">
            {clients.length === 0
              ? "No clients yet. Add your first one!"
              : "No clients match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const days = daysSinceContact(client);
            return (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                <div className="glass-card-hover rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.01]">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                          boxShadow: "0 0 12px rgba(124,58,237,0.4)",
                        }}
                      >
                        {client.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 text-sm group-hover:text-white transition-colors">
                          {client.name}
                        </p>
                        {client.company && (
                          <p className="text-xs text-slate-500">{client.company}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors mt-0.5" />
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3 h-3 text-slate-600 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3 h-3 text-slate-600 shrink-0" /> {client.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3 text-slate-600 shrink-0" />
                      {days !== null
                        ? `Last contact: ${days === 0 ? "today" : `${days}d ago`}`
                        : "No contact recorded"}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {client.tags.map((tag) => {
                      const s = tagStyles[tag] ?? {
                        bg: "rgba(100,116,139,0.1)",
                        border: "rgba(100,116,139,0.25)",
                        color: "#94a3b8",
                      };
                      return (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
