"use client";

import { useState, useEffect } from "react";
import {
  getContentLibrary,
  insertLibraryItem,
  updateLibraryItem,
} from "@/lib/db";
import type { ContentLibraryItem } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Copy,
  Search,
  Plus,
  Star,
  TrendingUp,
  Tag,
  Edit3,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categoryStyles: Record<
  ContentLibraryItem["category"],
  { bg: string; border: string; color: string }
> = {
  outreach: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", color: "#a78bfa" },
  social: { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.25)", color: "#f472b6" },
  email: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: "#fbbf24" },
  template: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", color: "#34d399" },
  blog: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", color: "#94a3b8" },
};

const statsConfig = [
  { label: "Total Templates", icon: BookOpen, iconColor: "#a78bfa" },
  { label: "Total Uses", icon: TrendingUp, iconColor: "#34d399" },
  { label: "Categories", icon: Tag, iconColor: "#fbbf24" },
  { label: "Top Performer", icon: Star, iconColor: "#fb7185" },
];

export default function LibraryPage() {
  const [items, setItems] = useState<ContentLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<
    ContentLibraryItem["category"] | "all"
  >("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    getContentLibrary()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === "all" || item.category === filterCat;
    return matchSearch && matchCat;
  });

  async function handleCopy(item: ContentLibraryItem) {
    navigator.clipboard.writeText(item.content);
    const newCount = item.use_count + 1;
    try {
      await updateLibraryItem(item.id, { use_count: newCount });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, use_count: newCount } : i))
      );
    } catch {
      // copy still succeeded
    }
    toast.success(`"${item.title}" copied to clipboard!`);
  }

  async function handleSaveEdit(id: string) {
    try {
      await updateLibraryItem(id, { content: editDraft });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, content: editDraft } : i))
      );
      setEditingId(null);
      toast.success("Template updated.");
    } catch {
      toast.error("Failed to save changes.");
    }
  }

  async function handleAdd(
    item: Omit<ContentLibraryItem, "id" | "created_at">
  ) {
    try {
      const newItem = await insertLibraryItem(item);
      setItems((prev) => [newItem, ...prev]);
      toast.success("Template added to library.");
    } catch {
      toast.error("Failed to add template.");
    }
  }

  const sortedFiltered = [...filtered].sort((a, b) => b.use_count - a.use_count);

  const statsValues = [
    items.length,
    items.reduce((sum, i) => sum + i.use_count, 0),
    new Set(items.map((i) => i.category)).size,
    `${[...items].sort((a, b) => b.use_count - a.use_count)[0]?.use_count ?? 0}x`,
  ];

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
              Content Library
            </span>
          </div>
          <h1 className="text-3xl font-bold gradient-heading mb-1 flex items-center gap-2.5">
            <BookOpen
              className="w-7 h-7 text-violet-400"
              style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.7))" }}
            />
            Content Library
          </h1>
          <p className="text-slate-400 text-sm">
            Reusable templates, best-performing drafts, and saved messaging.
          </p>
        </div>
        <AddLibraryItemDialog onAdd={handleAdd} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statsConfig.map((s, i) => (
          <div
            key={s.label}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-100 mt-0.5">
                  {statsValues[i]}
                </p>
              </div>
              <s.icon
                className="w-5 h-5"
                style={{ color: s.iconColor, filter: `drop-shadow(0 0 6px ${s.iconColor}60)` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-dark w-full pl-9 pr-4 h-10 rounded-xl text-sm outline-none"
            placeholder="Search templates by title, content, or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "outreach", "social", "email", "template", "blog"] as const).map(
            (cat) => {
              const active = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200"
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(99,102,241,0.6))",
                          border: "1px solid rgba(139,92,246,0.5)",
                          color: "#fff",
                          boxShadow: "0 0 10px rgba(124,58,237,0.25)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                        }
                  }
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div
            className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}
          />
          <p className="text-sm">Loading library…</p>
        </div>
      ) : sortedFiltered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">
            {items.length === 0
              ? "No templates yet. Add your first one!"
              : "No templates found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedFiltered.map((item) => {
            const cs = categoryStyles[item.category];
            return (
              <div key={item.id} className="glass-card-hover rounded-2xl p-5 transition-all duration-200">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-200 text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: cs.bg,
                          border: `1px solid ${cs.border}`,
                          color: cs.color,
                        }}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" /> {item.use_count} uses
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      onClick={() => {
                        setEditingId(item.id);
                        setEditDraft(item.content);
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      onClick={() => handleCopy(item)}
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                {editingId === item.id ? (
                  <div>
                    <Textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={6}
                      className="input-dark text-xs leading-relaxed resize-none rounded-xl"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="flex-1 h-8 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        style={{
                          background: "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(99,102,241,0.6))",
                          border: "1px solid rgba(139,92,246,0.4)",
                          color: "#fff",
                        }}
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 h-8 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          color: "#64748b",
                        }}
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-4 whitespace-pre-line">
                    {item.content}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "#475569",
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Performance notes */}
                {item.performance_notes && (
                  <p
                    className="text-[11px] rounded-xl px-3 py-2 mt-3 flex items-start gap-1.5 leading-relaxed"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      color: "#34d399",
                    }}
                  >
                    <Star className="w-3 h-3 mt-0.5 shrink-0" />
                    {item.performance_notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddLibraryItemDialog({
  onAdd,
}: {
  onAdd: (item: Omit<ContentLibraryItem, "id" | "created_at">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "outreach" as ContentLibraryItem["category"],
    tags: "",
    performance_notes: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) return;
    onAdd({
      title: form.title,
      content: form.content,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      performance_notes: form.performance_notes || undefined,
      use_count: 0,
    });
    setOpen(false);
    setForm({
      title: "",
      content: "",
      category: "outreach",
      tags: "",
      performance_notes: "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 0 16px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.3)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          />
        }
      >
        <Plus className="w-4 h-4" /> Add Template
      </DialogTrigger>
      <DialogContent
        style={{
          background: "linear-gradient(135deg, rgba(13,11,26,0.99), rgba(10,9,20,0.99))",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 60px rgba(139,92,246,0.1), 0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" /> Add to Content Library
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Title *
            </label>
            <input
              required
              placeholder="Template name"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as ContentLibraryItem["category"],
                })
              }
              className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
            >
              {["outreach", "social", "email", "template", "blog"].map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Content *
            </label>
            <Textarea
              required
              placeholder="Paste your template content here…"
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-dark resize-none rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Tags{" "}
              <span className="text-slate-600 font-normal">(comma-separated)</span>
            </label>
            <input
              placeholder="e.g. re-engagement, email, monthly"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Performance Notes
            </label>
            <input
              placeholder="e.g. High reply rate on Tuesdays"
              value={form.performance_notes}
              onChange={(e) =>
                setForm({ ...form, performance_notes: e.target.value })
              }
              className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 12px rgba(124,58,237,0.3)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              Save to Library
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
