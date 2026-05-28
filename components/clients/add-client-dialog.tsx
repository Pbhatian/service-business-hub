"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users } from "lucide-react";
import type { Client, ClientTag } from "@/types";
import { insertClient } from "@/lib/db";
import { toast } from "sonner";

interface Props {
  onAdd: (client: Client) => void;
}

export function AddClientDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service_type: "",
    notes: "",
    tags: "" as string,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;

    const rawTags = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean) as ClientTag[];

    setSaving(true);
    try {
      const newClient = await insertClient({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        service_type: form.service_type || undefined,
        notes: form.notes,
        tags: rawTags.length ? rawTags : ["new"],
        last_contact_date: null,
      });
      onAdd(newClient);
      toast.success(`${newClient.name} added to your client list.`);
      setOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        service_type: "",
        notes: "",
        tags: "",
      });
    } catch {
      toast.error("Failed to add client. Please try again.");
    } finally {
      setSaving(false);
    }
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
        <Plus className="w-4 h-4" /> Add Client
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
            <Users className="w-4 h-4 text-violet-400" /> Add New Client
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Full Name *
              </label>
              <input
                required
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Email *
              </label>
              <input
                required
                type="email"
                placeholder="client@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Phone
              </label>
              <input
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Company
              </label>
              <input
                placeholder="Company name"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Service Type
              </label>
              <input
                placeholder="e.g. Brand Consulting, Coaching…"
                value={form.service_type}
                onChange={(e) =>
                  setForm({ ...form, service_type: e.target.value })
                }
                className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Tags{" "}
                <span className="text-slate-600 font-normal">
                  (comma-separated: active, vip, new…)
                </span>
              </label>
              <input
                placeholder="active, high-value"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="input-dark w-full h-10 rounded-xl px-3 text-sm outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Notes
              </label>
              <Textarea
                placeholder="Any relevant background, interests, or goals…"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-dark resize-none rounded-xl"
              />
            </div>
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
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 12px rgba(124,58,237,0.3)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              {saving ? "Saving…" : "Add Client"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
