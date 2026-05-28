import { Users, MessageSquare, Bell, CalendarDays, TrendingUp, Clock, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getClients, getFollowUps, getMessageLogs, getContentCalendar } from "@/lib/db";
import { differenceInDays, format, parseISO } from "date-fns";

export default async function DashboardPage() {
  const today = new Date();

  const [clients, followUps, messageLogs, contentCalendar] = await Promise.all([
    getClients(),
    getFollowUps(),
    getMessageLogs(),
    getContentCalendar(),
  ]);

  const overdueFollowUps = followUps.filter((f) => {
    const d = parseISO(f.reminder_date);
    return f.follow_up_status === "pending" && d <= today;
  });

  const inactiveClients = clients.filter((c) => {
    if (!c.last_contact_date) return true;
    return differenceInDays(today, parseISO(c.last_contact_date)) >= 30;
  });

  const drafts = messageLogs.filter((m) => m.sent_status === "draft");
  const scheduledContent = contentCalendar.filter((c) => c.status === "scheduled");

  const stats = [
    {
      title: "Total Clients",
      value: clients.length,
      sub: `${clients.filter((c) => c.tags.includes("active")).length} active`,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/dashboard/clients",
    },
    {
      title: "Overdue Follow-Ups",
      value: overdueFollowUps.length,
      sub: "Need attention",
      icon: Bell,
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/dashboard/follow-ups",
    },
    {
      title: "Outreach Drafts",
      value: drafts.length,
      sub: "Ready to send",
      icon: MessageSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/outreach",
    },
    {
      title: "Scheduled Posts",
      value: scheduledContent.length,
      sub: "Content queued",
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/dashboard/content",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Good morning 👋</h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s your business overview for{" "}
          {format(today, "MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <Link key={s.title} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{s.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                  </div>
                  <div className={`${s.bg} p-2.5 rounded-xl`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inactive clients alert */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                Clients Needing Attention
              </CardTitle>
              <Link href="/dashboard/clients">
                <Button variant="ghost" size="sm" className="text-xs text-violet-600 h-7">
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {inactiveClients.slice(0, 4).map((client) => {
              const days = client.last_contact_date
                ? differenceInDays(today, parseISO(client.last_contact_date))
                : null;
              return (
                <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                  <div className="flex items-center justify-between py-2 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {client.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{client.name}</p>
                        <p className="text-xs text-slate-400">{client.service_type ?? "—"}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium">
                      {days !== null ? `${days}d ago` : "No contact"}
                    </span>
                  </div>
                </Link>
              );
            })}
            {inactiveClients.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">All clients are up to date ✅</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming follow-ups */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                Upcoming Follow-Ups
              </CardTitle>
              <Link href="/dashboard/follow-ups">
                <Button variant="ghost" size="sm" className="text-xs text-violet-600 h-7">
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {followUps.filter((f) => f.follow_up_status !== "completed").slice(0, 4).map((fu) => {
              const isOverdue =
                parseISO(fu.reminder_date) <= today && fu.follow_up_status === "pending";
              return (
                <div key={fu.id} className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                      {fu.client?.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{fu.client?.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{fu.notes}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isOverdue
                        ? "bg-rose-50 text-rose-600"
                        : fu.follow_up_status === "snoozed"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-violet-50 text-violet-600"
                    }`}
                  >
                    {format(parseISO(fu.reminder_date), "MMM d")}
                  </span>
                </div>
              );
            })}
            {followUps.filter((f) => f.follow_up_status !== "completed").length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No upcoming follow-ups ✅</p>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Add New Client", href: "/dashboard/clients", color: "bg-violet-600 hover:bg-violet-700" },
                { label: "Generate Outreach", href: "/dashboard/outreach", color: "bg-emerald-600 hover:bg-emerald-700" },
                { label: "Create Content", href: "/dashboard/content", color: "bg-amber-600 hover:bg-amber-700" },
                { label: "View Library", href: "/dashboard/library", color: "bg-slate-700 hover:bg-slate-800" },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <button
                    className={`w-full text-white text-sm font-medium py-3 px-4 rounded-xl transition-colors ${action.color}`}
                  >
                    {action.label}
                  </button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
