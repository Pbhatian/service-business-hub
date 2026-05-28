"use client";

import { useState } from "react";
import Link from "next/link";
import { mockClients } from "@/lib/mock-data";
import type { Client, ClientTag } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Clock,
  ChevronRight,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { AddClientDialog } from "@/components/clients/add-client-dialog";

const tagColors: Record<ClientTag, string> = {
  "high-value": "bg-amber-50 text-amber-700",
  new: "bg-sky-50 text-sky-700",
  inactive: "bg-rose-50 text-rose-700",
  vip: "bg-purple-50 text-purple-700",
  referral: "bg-teal-50 text-teal-700",
  "follow-up": "bg-orange-50 text-orange-700",
  prospect: "bg-blue-50 text-blue-700",
  active: "bg-emerald-50 text-emerald-700",
  churned: "bg-slate-100 text-slate-500",
};

function daysSinceContact(client: Client) {
  if (!client.last_contact_date) return null;
  return differenceInDays(new Date("2026-05-28"), parseISO(client.last_contact_date));
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<ClientTag | "all">("all");
  const [clients, setClients] = useState<Client[]>(mockClients);

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === "all" || c.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  const tagCounts: Partial<Record<ClientTag, number>> = {};
  clients.forEach((c) =>
    c.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] ?? 0) + 1))
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" /> Clients
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {clients.length} total · {clients.filter((c) => c.tags.includes("active")).length} active
          </p>
        </div>
        <AddClientDialog onAdd={(c) => setClients((prev) => [c, ...prev])} />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200"
            placeholder="Search clients by name, email or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "active", "inactive", "vip", "new", "follow-up"] as const).map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant={filterTag === tag ? "default" : "outline"}
              className={`text-xs h-9 ${filterTag === tag ? "bg-violet-600 hover:bg-violet-700" : "border-slate-200"}`}
              onClick={() => setFilterTag(tag)}
            >
              {tag === "all" ? "All" : tag}
              {tag !== "all" && tagCounts[tag] ? (
                <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-[10px]">
                  {tagCounts[tag]}
                </span>
              ) : null}
            </Button>
          ))}
        </div>
      </div>

      {/* Client cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No clients match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const days = daysSinceContact(client);
            return (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                          {client.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm group-hover:text-violet-600 transition-colors">
                            {client.name}
                          </p>
                          {client.company && (
                            <p className="text-xs text-slate-400">{client.company}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors mt-0.5" />
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3" /> {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {days !== null
                          ? `Last contact: ${days === 0 ? "today" : `${days} days ago`}`
                          : "No contact recorded"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tagColors[tag]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

