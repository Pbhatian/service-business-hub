import { Users, MessageSquare, Bell, CalendarDays, TrendingUp, Clock, Zap, ArrowRight, Sparkles } from "lucide-react";
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
      cardClass: "stat-card-violet",
      iconColor: "text-violet-400",
      glowColor: "rgba(139,92,246,0.3)",
      href: "/dashboard/clients",
    },
    {
      title: "Overdue Follow-Ups",
      value: overdueFollowUps.length,
      sub: "Need attention",
      icon: Bell,
      cardClass: "stat-card-rose",
      iconColor: "text-rose-400",
      glowColor: "rgba(244,63,94,0.3)",
      href: "/dashboard/follow-ups",
    },
    {
      title: "Outreach Drafts",
      value: drafts.length,
      sub: "Ready to send",
      icon: MessageSquare,
      cardClass: "stat-card-amber",
      iconColor: "text-amber-400",
      glowColor: "rgba(245,158,11,0.3)",
      href: "/dashboard/outreach",
    },
    {
      title: "Scheduled Posts",
      value: scheduledContent.length,
      sub: "Content queued",
      icon: CalendarDays,
      cardClass: "stat-card-emerald",
      iconColor: "text-emerald-400",
      glowColor: "rgba(16,185,129,0.3)",
      href: "/dashboard/content",
    },
  ];

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-violet-400" style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.8))" }} />
          <span className="text-xs font-medium tracking-widest uppercase text-violet-400/80">AI-Powered Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold gradient-heading mb-1">
          {greeting} 👋
        </h1>
        <p className="text-slate-400 text-sm">
          Business overview for{" "}
          <span className="text-slate-300 font-medium">{format(today, "MMMM d, yyyy")}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.title} href={s.href}>
            <div
              className={`${s.cardClass} rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] group`}
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${s.glowColor} 0%, transparent 70%)`,
                    border: `1px solid ${s.glowColor}`,
                  }}
                >
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <p className="text-3xl font-bold text-white mb-0.5">{s.value}</p>
              <p className="text-xs font-semibold text-slate-300">{s.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inactive clients */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" style={{ filter: "drop-shadow(0 0 4px rgba(244,63,94,0.6))" }} />
              <span className="text-sm font-semibold text-slate-200">Clients Needing Attention</span>
            </div>
            <Link href="/dashboard/clients">
              <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="px-5 py-3 space-y-1">
            {inactiveClients.slice(0, 4).map((client) => {
              const days = client.last_contact_date
                ? differenceInDays(today, parseISO(client.last_contact_date))
                : null;
              return (
                <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                  <div className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl transition-all duration-200 hover:bg-white/[0.04] group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                          boxShadow: "0 0 8px rgba(124,58,237,0.4)",
                        }}
                      >
                        {client.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.service_type ?? "—"}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                      style={{
                        background: "rgba(244,63,94,0.12)",
                        border: "1px solid rgba(244,63,94,0.3)",
                        color: "#fb7185",
                      }}
                    >
                      {days !== null ? `${days}d ago` : "No contact"}
                    </span>
                  </div>
                </Link>
              );
            })}
            {inactiveClients.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-5">All clients are up to date ✅</p>
            )}
          </div>
        </div>

        {/* Upcoming follow-ups */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" style={{ filter: "drop-shadow(0 0 4px rgba(167,139,250,0.6))" }} />
              <span className="text-sm font-semibold text-slate-200">Upcoming Follow-Ups</span>
            </div>
            <Link href="/dashboard/follow-ups">
              <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="px-5 py-3 space-y-1">
            {followUps.filter((f) => f.follow_up_status !== "completed").slice(0, 4).map((fu) => {
              const isOverdue = parseISO(fu.reminder_date) <= today && fu.follow_up_status === "pending";
              return (
                <div key={fu.id} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #6d28d9, #5b21b6)", boxShadow: "0 0 8px rgba(109,40,217,0.4)" }}
                    >
                      {fu.client?.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{fu.client?.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{fu.notes}</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                    style={
                      isOverdue
                        ? { background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", color: "#fb7185" }
                        : fu.follow_up_status === "snoozed"
                        ? { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }
                        : { background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }
                    }
                  >
                    {format(parseISO(fu.reminder_date), "MMM d")}
                  </span>
                </div>
              );
            })}
            {followUps.filter((f) => f.follow_up_status !== "completed").length === 0 && (
              <p className="text-sm text-slate-500 text-center py-5">No upcoming follow-ups ✅</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-2xl overflow-hidden lg:col-span-2">
          <div className="flex items-center gap-2 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Zap className="w-4 h-4 text-amber-400" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.6))" }} />
            <span className="text-sm font-semibold text-slate-200">Quick Actions</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Add New Client", href: "/dashboard/clients", color: "rgba(124,58,237,0.8)", glow: "rgba(124,58,237,0.4)" },
                { label: "Generate Outreach", href: "/dashboard/outreach", color: "rgba(16,185,129,0.8)", glow: "rgba(16,185,129,0.3)" },
                { label: "Create Content", href: "/dashboard/content", color: "rgba(245,158,11,0.8)", glow: "rgba(245,158,11,0.3)" },
                { label: "View Library", href: "/dashboard/library", color: "rgba(99,102,241,0.8)", glow: "rgba(99,102,241,0.3)" },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <button
                    className="w-full text-white text-sm font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${action.color}, ${action.color.replace("0.8", "0.6")})`,
                      boxShadow: `0 0 16px ${action.glow}, 0 4px 12px rgba(0,0,0,0.3)`,
                      border: `1px solid ${action.glow}`,
                    }}
                  >
                    {action.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
