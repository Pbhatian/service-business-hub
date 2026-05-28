"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getClientById, getMessageLogsByClientId, getFollowUpsByClientId } from "@/lib/db";
import type { Client, MessageLog, FollowUpSchedule, ClientTag } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

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
    ]).then(([c, msgs, fus]) => {
      if (!c) {
        setNotFoundState(true);
      } else {
        setClient(c);
        setMessages(msgs);
        setFollowUps(fus);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center py-20 text-slate-400">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading client profile…</p>
      </div>
    );
  }

  if (notFoundState || !client) {
    return (
      <div className="p-8 text-center py-20 text-slate-400">
        <p className="text-lg font-semibold text-slate-700">Client not found</p>
        <Link href="/dashboard/clients">
          <Button variant="outline" className="mt-4">← Back to Clients</Button>
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
        <Button variant="ghost" size="sm" className="mb-5 text-slate-500 hover:text-slate-800 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Clients
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-2xl">
            {client.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            {client.company && (
              <p className="text-slate-500 text-sm">{client.company}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {client.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${tagColors[tag] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Link href={`/dashboard/outreach?client=${id}`}>
          <Button className="bg-violet-600 hover:bg-violet-700">
            <MessageSquare className="w-4 h-4 mr-2" /> Generate Outreach
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Contact info */}
        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`mailto:${client.email}`} className="hover:text-violet-600">
                {client.email}
              </a>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                {client.phone}
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                {client.company}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              {days !== null
                ? `Last contacted ${days === 0 ? "today" : `${days} days ago`} (${format(parseISO(client.last_contact_date!), "MMM d, yyyy")})`
                : "No contact recorded"}
            </div>
            {client.service_type && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                {client.service_type}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
                <span className="text-sm font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="border-0 shadow-sm mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" /> Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed">
            {client.notes || "No notes added yet."}
          </p>
        </CardContent>
      </Card>

      {/* Message history */}
      {messages.length > 0 && (
        <Card className="border-0 shadow-sm mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Message History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-[10px] capitalize bg-white border border-slate-200">
                    {msg.message_type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        msg.sent_status === "sent"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {msg.sent_status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {format(parseISO(msg.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-3">
                  {msg.draft_content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Follow-ups */}
      {followUps.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" /> Follow-Ups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {followUps.map((fu) => (
              <div key={fu.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-slate-700">{fu.notes}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(parseISO(fu.reminder_date), "MMMM d, yyyy")}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                    fu.follow_up_status === "completed"
                      ? "bg-emerald-50 text-emerald-600"
                      : fu.follow_up_status === "snoozed"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {fu.follow_up_status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
