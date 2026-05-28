"use client";

import { useState, useEffect } from "react";
import {
  getContentCalendar,
  insertContentItem,
  updateContentItem,
} from "@/lib/db";
import { generateWeeklyContent } from "@/lib/ai-stub";
import type { ContentCalendarItem } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  Sparkles,
  Copy,
  RefreshCw,
  Camera,
  Briefcase,
  FileText,
  Mail,
  AtSign,
  Plus,
  CheckCircle,
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { toast } from "sonner";

const platformIcons: Record<ContentCalendarItem["post_type"], React.ReactNode> = {
  instagram: <Camera className="w-3.5 h-3.5" />,
  linkedin: <Briefcase className="w-3.5 h-3.5" />,
  blog: <FileText className="w-3.5 h-3.5" />,
  newsletter: <Mail className="w-3.5 h-3.5" />,
  twitter: <AtSign className="w-3.5 h-3.5" />,
};

const platformStyles: Record<
  ContentCalendarItem["post_type"],
  { bg: string; border: string; color: string }
> = {
  instagram: { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.25)", color: "#f472b6" },
  linkedin: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", color: "#60a5fa" },
  blog: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", color: "#94a3b8" },
  newsletter: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: "#fbbf24" },
  twitter: { bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.25)", color: "#38bdf8" },
};

const statusStyles: Record<
  ContentCalendarItem["status"],
  { bg: string; border: string; color: string }
> = {
  draft: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: "#fbbf24" },
  scheduled: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", color: "#a78bfa" },
  published: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", color: "#34d399" },
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<ContentCalendarItem | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genPlatform, setGenPlatform] =
    useState<ContentCalendarItem["post_type"]>("linkedin");
  const [genNiche, setGenNiche] = useState("solo consulting");
  const [view, setView] = useState<"calendar" | "list">("list");

  useEffect(() => {
    getContentCalendar()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const weekStart = new Date("2026-06-01");
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  async function handleGenerate() {
    if (!genTopic || !genPlatform) {
      toast.error("Please fill in topic and platform.");
      return;
    }
    setGenerating(true);
    try {
      const content = await generateWeeklyContent(genTopic, genPlatform, genNiche);
      const newItem = await insertContentItem({
        post_type: genPlatform,
        draft_content: content,
        topic: genTopic,
        scheduled_date: format(addDays(new Date(), 3), "yyyy-MM-dd"),
        status: "draft",
      });
      setItems((prev) => [newItem, ...prev]);
      setActiveItem(newItem);
      toast.success("Content generated! Edit and schedule it below.");
    } catch {
      toast.error("Failed to save content.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleStatusChange(
    id: string,
    status: ContentCalendarItem["status"]
  ) {
    try {
      await updateContentItem(id, { status });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      if (activeItem?.id === id)
        setActiveItem((prev) => (prev ? { ...prev, status } : null));
      toast.success(`Status updated to "${status}".`);
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function handleSaveEdit(content: string) {
    if (!activeItem) return;
    try {
      await updateContentItem(activeItem.id, { draft_content: content });
      setItems((prev) =>
        prev.map((i) =>
          i.id === activeItem.id ? { ...i, draft_content: content } : i
        )
      );
      setActiveItem({ ...activeItem, draft_content: content });
      toast.success("Draft saved.");
    } catch {
      toast.error("Failed to save draft.");
    }
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles
            className="w-4 h-4 text-violet-400"
            style={{ filter: "drop-shadow(0 0 5px rgba(167,139,250,0.8))" }}
          />
          <span className="text-xs font-medium tracking-widest uppercase text-violet-400/70">
            Content Planning
          </span>
        </div>
        <h1 className="text-3xl font-bold gradient-heading mb-1 flex items-center gap-2.5">
          <CalendarDays
            className="w-7 h-7 text-violet-400"
            style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.7))" }}
          />
          Content Calendar
        </h1>
        <p className="text-slate-400 text-sm">
          AI-generated posts for Instagram, LinkedIn, Blog & more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Generator panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Generate New Content
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Topic / Theme
                </label>
                <input
                  placeholder="e.g. Client retention, Personal branding…"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Your Niche
                </label>
                <input
                  placeholder="e.g. freelance design, wellness coaching…"
                  value={genNiche}
                  onChange={(e) => setGenNiche(e.target.value)}
                  className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["linkedin", "instagram", "blog", "newsletter"] as const).map((p) => {
                    const active = genPlatform === p;
                    const ps = platformStyles[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setGenPlatform(p)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200"
                        style={
                          active
                            ? {
                                background: ps.bg,
                                border: `1px solid ${ps.border}`,
                                color: ps.color,
                                boxShadow: `0 0 8px ${ps.bg}`,
                              }
                            : {
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#64748b",
                              }
                        }
                      >
                        {platformIcons[p]}
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Generate Post
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Edit panel */}
          {activeItem && (
            <div
              className="glass-card rounded-2xl p-5"
              style={{ borderLeft: "3px solid rgba(139,92,246,0.6)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-400 truncate max-w-[160px]">
                  Editing: {activeItem.topic}
                </p>
                <span
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium"
                  style={{
                    background: platformStyles[activeItem.post_type].bg,
                    border: `1px solid ${platformStyles[activeItem.post_type].border}`,
                    color: platformStyles[activeItem.post_type].color,
                  }}
                >
                  {platformIcons[activeItem.post_type]}
                  {activeItem.post_type}
                </span>
              </div>
              <div className="space-y-3">
                <EditableContent
                  key={activeItem.id}
                  initial={activeItem.draft_content}
                  onSave={handleSaveEdit}
                />
                <div className="flex gap-2">
                  {(["draft", "scheduled", "published"] as const).map((s) => {
                    const isActive = activeItem.status === s;
                    const ss = statusStyles[s];
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(activeItem.id, s)}
                        className="flex-1 text-[11px] py-1.5 rounded-lg font-medium transition-all"
                        style={
                          isActive
                            ? {
                                background: ss.bg,
                                border: `1px solid ${ss.border}`,
                                color: ss.color,
                              }
                            : {
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                color: "#475569",
                              }
                        }
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(["list", "calendar"] as const).map((v) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200"
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(99,102,241,0.6))",
                            border: "1px solid rgba(139,92,246,0.5)",
                            color: "#fff",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#94a3b8",
                          }
                    }
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)} View
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              <span className="text-slate-300 font-medium">{items.length}</span> posts total
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <div
                className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}
              />
              <p className="text-sm">Loading content…</p>
            </div>
          ) : view === "list" ? (
            <div className="space-y-3">
              {items.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No content yet. Generate your first post!</p>
                </div>
              )}
              {items.map((item) => {
                const ps = platformStyles[item.post_type];
                const ss = statusStyles[item.status];
                return (
                  <div
                    key={item.id}
                    className="glass-card-hover rounded-2xl p-4 cursor-pointer transition-all duration-200"
                    style={
                      activeItem?.id === item.id
                        ? { outline: "1px solid rgba(139,92,246,0.5)" }
                        : {}
                    }
                    onClick={() => setActiveItem(item)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: ps.bg,
                              border: `1px solid ${ps.border}`,
                              color: ps.color,
                            }}
                          >
                            {platformIcons[item.post_type]}
                            {item.post_type}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {format(parseISO(item.scheduled_date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200 mb-1">{item.topic}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.draft_content}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: ss.bg,
                            border: `1px solid ${ss.border}`,
                            color: ss.color,
                          }}
                        >
                          {item.status}
                        </span>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.draft_content);
                            toast.success("Copied!");
                          }}
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Calendar view */
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const dayItems = items.filter((i) => i.scheduled_date === dayStr);
                return (
                  <div key={dayStr} className="min-h-[120px]">
                    <div className="text-center mb-2">
                      <p className="text-[10px] text-slate-500 font-medium uppercase">
                        {format(day, "EEE")}
                      </p>
                      <p className="text-sm font-semibold text-slate-300">
                        {format(day, "d")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {dayItems.map((item) => {
                        const ps = platformStyles[item.post_type];
                        return (
                          <div
                            key={item.id}
                            onClick={() => setActiveItem(item)}
                            className="text-[9px] px-1.5 py-1 rounded-lg cursor-pointer flex items-center gap-0.5 truncate"
                            style={{
                              background: ps.bg,
                              border: `1px solid ${ps.border}`,
                              color: ps.color,
                            }}
                          >
                            {platformIcons[item.post_type]}
                            <span className="ml-0.5">{item.topic}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditableContent({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={8}
        className="input-dark text-xs leading-relaxed resize-none rounded-xl"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          className="flex-1 h-8 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          style={
            saved
              ? {
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  color: "#34d399",
                }
              : {
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  color: "#a78bfa",
                }
          }
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied!");
          }}
          className="flex-1 h-8 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#94a3b8",
          }}
        >
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
      </div>
    </div>
  );
}
