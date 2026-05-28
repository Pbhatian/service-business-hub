"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarDays,
  Bell,
  BookOpen,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
  { href: "/dashboard/outreach", icon: MessageSquare, label: "AI Outreach" },
  { href: "/dashboard/content", icon: CalendarDays, label: "Content Calendar" },
  { href: "/dashboard/follow-ups", icon: Bell, label: "Follow-Ups" },
  { href: "/dashboard/library", icon: BookOpen, label: "Content Library" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col"
      style={{
        background: "linear-gradient(180deg, rgba(13,11,26,0.98) 0%, rgba(10,9,20,0.99) 100%)",
        borderRight: "1px solid rgba(139,92,246,0.12)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow: "0 0 16px rgba(124,58,237,0.5), 0 0 32px rgba(124,58,237,0.2)",
          }}
        >
          <Zap className="w-4.5 h-4.5 text-white" />
          {/* Animated pulse ring */}
          <span className="absolute inset-0 rounded-xl animate-ping opacity-20"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }} />
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-none tracking-wide">Service Business</p>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: "rgba(167,139,250,0.8)" }}>Hub — AI Assistant</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-dark">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "text-violet-300"
                  : "text-slate-400 hover:text-slate-200"
              )}
              style={active ? {
                background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.12))",
                border: "1px solid rgba(139,92,246,0.3)",
                boxShadow: "0 0 12px rgba(124,58,237,0.15)",
              } : {
                border: "1px solid transparent",
              }}
            >
              <span className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                active
                  ? "text-violet-400"
                  : "text-slate-500 group-hover:text-violet-400"
              )}>
                <Icon className="w-4 h-4" />
              </span>
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
          <p className="text-[11px] font-medium" style={{ color: "rgba(148,163,184,0.7)" }}>
            AI System Online
          </p>
        </div>
        <p className="text-[10px] mt-1" style={{ color: "rgba(100,116,139,0.5)" }}>v1.0 · Capstone Project</p>
      </div>
    </aside>
  );
}
