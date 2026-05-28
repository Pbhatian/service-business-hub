"use client";

import { useState } from "react";
import { mockContentCalendar } from "@/lib/mock-data";
import { generateWeeklyContent } from "@/lib/ai-stub";
import type { ContentCalendarItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { format, parseISO, startOfWeek, addDays } from "date-fns";
import { toast } from "sonner";

const platformIcons: Record<ContentCalendarItem["post_type"], React.ReactNode> = {
  instagram: <Camera className="w-3.5 h-3.5" />,
  linkedin: <Briefcase className="w-3.5 h-3.5" />,
  blog: <FileText className="w-3.5 h-3.5" />,
  newsletter: <Mail className="w-3.5 h-3.5" />,
  twitter: <AtSign className="w-3.5 h-3.5" />,
};

const platformColors: Record<ContentCalendarItem["post_type"], string> = {
  instagram: "bg-pink-50 text-pink-600 border-pink-100",
  linkedin: "bg-blue-50 text-blue-600 border-blue-100",
  blog: "bg-slate-50 text-slate-600 border-slate-200",
  newsletter: "bg-amber-50 text-amber-600 border-amber-100",
  twitter: "bg-sky-50 text-sky-600 border-sky-100",
};

const statusColors: Record<ContentCalendarItem["status"], string> = {
  draft: "bg-amber-50 text-amber-600",
  scheduled: "bg-violet-50 text-violet-600",
  published: "bg-emerald-50 text-emerald-600",
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentCalendarItem[]>(mockContentCalendar);
  const [activeItem, setActiveItem] = useState<ContentCalendarItem | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genPlatform, setGenPlatform] = useState<ContentCalendarItem["post_type"]>("linkedin");
  const [genNiche, setGenNiche] = useState("solo consulting");
  const [view, setView] = useState<"calendar" | "list">("list");

  // Build a simple weekly view (next 7 days from June 1)
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
      const newItem: ContentCalendarItem = {
        id: `cc${Date.now()}`,
        post_type: genPlatform,
        draft_content: content,
        topic: genTopic,
        scheduled_date: format(addDays(new Date(), 3), "yyyy-MM-dd"),
        status: "draft",
        created_at: new Date().toISOString().split("T")[0],
      };
      setItems((prev) => [newItem, ...prev]);
      setActiveItem(newItem);
      toast.success("Content generated! Edit and schedule it below.");
    } finally {
      setGenerating(false);
    }
  }

  function handleStatusChange(id: string, status: ContentCalendarItem["status"]) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    if (activeItem?.id === id) setActiveItem((prev) => prev ? { ...prev, status } : null);
    toast.success(`Status updated to "${status}".`);
  }

  function handleSaveEdit(content: string) {
    if (!activeItem) return;
    setItems((prev) =>
      prev.map((i) => (i.id === activeItem.id ? { ...i, draft_content: content } : i))
    );
    setActiveItem({ ...activeItem, draft_content: content });
    toast.success("Draft saved.");
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-violet-600" /> Content Calendar
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          AI-generated posts for Instagram, LinkedIn, Blog & more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Generator panel */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" /> Generate New Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Topic / Theme</label>
                <Input
                  placeholder="e.g. Client retention, Personal branding…"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Your Niche</label>
                <Input
                  placeholder="e.g. freelance design, wellness coaching…"
                  value={genNiche}
                  onChange={(e) => setGenNiche(e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {(["linkedin", "instagram", "blog", "newsletter"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setGenPlatform(p)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                        genPlatform === p
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      {platformIcons[p]}
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-violet-600 hover:bg-violet-700 h-10"
              >
                {generating ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Generate Post</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Edit panel */}
          {activeItem && (
            <Card className="border-0 shadow-sm border-l-4 border-l-violet-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Editing: {activeItem.topic}
                  </CardTitle>
                  <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${platformColors[activeItem.post_type]}`}>
                    {platformIcons[activeItem.post_type]}
                    {activeItem.post_type}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <EditableContent
                  key={activeItem.id}
                  initial={activeItem.draft_content}
                  onSave={handleSaveEdit}
                />
                <div className="flex gap-2">
                  {(["draft", "scheduled", "published"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(activeItem.id, s)}
                      className={`flex-1 text-[11px] py-1.5 rounded-lg font-medium transition-colors ${
                        activeItem.status === s
                          ? statusColors[s] + " ring-1 ring-current"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(["list", "calendar"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    view === v ? "bg-violet-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)} View
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">{items.length} posts total</p>
          </div>

          {view === "list" ? (
            <div className="space-y-3">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`border-0 shadow-sm cursor-pointer hover:shadow-md transition-all ${
                    activeItem?.id === item.id ? "ring-2 ring-violet-400" : ""
                  }`}
                  onClick={() => setActiveItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${platformColors[item.post_type]}`}>
                            {platformIcons[item.post_type]}
                            {item.post_type}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {format(parseISO(item.scheduled_date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 mb-1">{item.topic}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.draft_content}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.draft_content);
                            toast.success("Copied!");
                          }}
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{format(day, "EEE")}</p>
                      <p className="text-sm font-semibold text-slate-700">{format(day, "d")}</p>
                    </div>
                    <div className="space-y-1">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setActiveItem(item)}
                          className={`text-[10px] px-2 py-1.5 rounded-lg cursor-pointer border ${platformColors[item.post_type]} truncate`}
                        >
                          {platformIcons[item.post_type]}
                          <span className="ml-1">{item.topic}</span>
                        </div>
                      ))}
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

function EditableContent({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
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
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        rows={8}
        className="text-xs leading-relaxed resize-none bg-white border-slate-200"
      />
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="outline" onClick={handleSave} className={`flex-1 ${saved ? "text-emerald-600 border-emerald-200" : ""}`}>
          {saved ? <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Saved</> : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Save</>}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied!"); }} className="flex-1">
          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
        </Button>
      </div>
    </div>
  );
}
