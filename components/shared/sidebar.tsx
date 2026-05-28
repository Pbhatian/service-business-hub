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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-none">Service Business</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Hub</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-violet-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-[11px] text-slate-500">
          AI-Powered Business Assistant
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">v1.0 · Capstone</p>
      </div>
    </aside>
  );
}
