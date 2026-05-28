"use client";

import { useState } from "react";
import { mockContentLibrary } from "@/lib/mock-data";
import type { ContentLibraryItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categoryColors: Record<ContentLibraryItem["category"], string> = {
  outreach: "bg-violet-50 text-violet-700 border-violet-100",
  social: "bg-pink-50 text-pink-700 border-pink-100",
  email: "bg-amber-50 text-amber-700 border-amber-100",
  template: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blog: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function LibraryPage() {
  const [items, setItems] = useState<ContentLibraryItem[]>(mockContentLibrary);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<ContentLibraryItem["category"] | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const filtered = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === "all" || item.category === filterCat;
    return matchSearch && matchCat;
  });

  function handleCopy(item: ContentLibraryItem) {
    navigator.clipboard.writeText(item.content);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, use_count: i.use_count + 1 } : i))
    );
    toast.success(`"${item.title}" copied to clipboard!`);
  }

  function handleSaveEdit(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, content: editDraft } : i))
    );
    setEditingId(null);
    toast.success("Template updated.");
  }

  function handleAdd(item: ContentLibraryItem) {
    setItems((prev) => [item, ...prev]);
    toast.success("Template added to library.");
  }

  const sortedFiltered = [...filtered].sort((a, b) => b.use_count - a.use_count);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-600" /> Content Library
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Reusable templates, best-performing drafts, and saved messaging.
          </p>
        </div>
        <AddLibraryItemDialog onAdd={handleAdd} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Templates", value: items.length, icon: BookOpen, color: "text-violet-600" },
          { label: "Total Uses", value: items.reduce((sum, i) => sum + i.use_count, 0), icon: TrendingUp, color: "text-emerald-600" },
          { label: "Categories", value: new Set(items.map((i) => i.category)).size, icon: Tag, color: "text-amber-600" },
          { label: "Top Performer", value: `${[...items].sort((a, b) => b.use_count - a.use_count)[0]?.use_count ?? 0}x`, icon: Star, color: "text-rose-500" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</p>
                </div>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200"
            placeholder="Search templates by title, content, or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "outreach", "social", "email", "template", "blog"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                filterCat === cat
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
              }`}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {sortedFiltered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No templates found. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedFiltered.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" /> {item.use_count} uses
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditDraft(item.content);
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleCopy(item)}
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                {editingId === item.id ? (
                  <div>
                    <Textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={6}
                      className="text-xs leading-relaxed resize-none bg-slate-50 border-slate-200"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(item.id)}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 h-8 text-xs"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="flex-1 h-8 text-xs"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                    {item.content}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Performance notes */}
                {item.performance_notes && (
                  <p className="text-[11px] text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mt-3 flex items-start gap-1.5">
                    <Star className="w-3 h-3 mt-0.5 shrink-0" />
                    {item.performance_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddLibraryItemDialog({ onAdd }: { onAdd: (item: ContentLibraryItem) => void }) {
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
      id: `l${Date.now()}`,
      title: form.title,
      content: form.content,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      performance_notes: form.performance_notes || undefined,
      use_count: 0,
      created_at: new Date().toISOString().split("T")[0],
    });
    setOpen(false);
    setForm({ title: "", content: "", category: "outreach", tags: "", performance_notes: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700" />}>
        <Plus className="w-4 h-4 mr-2" /> Add Template
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Content Library</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Title *</label>
            <Input required placeholder="Template name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ContentLibraryItem["category"] })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {["outreach", "social", "email", "template", "blog"].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Content *</label>
            <Textarea required placeholder="Paste your template content here…" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Tags <span className="text-slate-400 font-normal">(comma-separated)</span></label>
            <Input placeholder="e.g. re-engagement, email, monthly" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Performance Notes</label>
            <Input placeholder="e.g. High reply rate on Tuesdays" value={form.performance_notes} onChange={(e) => setForm({ ...form, performance_notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Save to Library</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
