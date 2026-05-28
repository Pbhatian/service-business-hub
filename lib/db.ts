import { supabase } from "./supabase";
import type {
  Client,
  MessageLog,
  ContentCalendarItem,
  FollowUpSchedule,
  ContentLibraryItem,
} from "@/types";

// ── Clients ───────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Client;
}

export async function insertClient(
  client: Omit<Client, "id" | "created_at">
): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert(client)
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

// ── Message Logs ──────────────────────────────────────────────────────────────

export async function getMessageLogs(): Promise<MessageLog[]> {
  const { data, error } = await supabase
    .from("message_logs")
    .select("*, client:clients(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MessageLog[];
}

export async function getMessageLogsByClientId(clientId: string): Promise<MessageLog[]> {
  const { data, error } = await supabase
    .from("message_logs")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MessageLog[];
}

export async function insertMessageLog(
  log: Pick<MessageLog, "client_id" | "message_type" | "draft_content" | "sent_status">
): Promise<MessageLog> {
  const { data, error } = await supabase
    .from("message_logs")
    .insert(log)
    .select("*, client:clients(*)")
    .single();
  if (error) throw error;
  return data as MessageLog;
}

// ── Follow-Ups ────────────────────────────────────────────────────────────────

export async function getFollowUps(): Promise<FollowUpSchedule[]> {
  const { data, error } = await supabase
    .from("follow_up_schedule")
    .select("*, client:clients(*)")
    .order("reminder_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FollowUpSchedule[];
}

export async function getFollowUpsByClientId(clientId: string): Promise<FollowUpSchedule[]> {
  const { data, error } = await supabase
    .from("follow_up_schedule")
    .select("*")
    .eq("client_id", clientId)
    .order("reminder_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as FollowUpSchedule[];
}

export async function updateFollowUpStatus(
  id: string,
  status: FollowUpSchedule["follow_up_status"]
): Promise<void> {
  const { error } = await supabase
    .from("follow_up_schedule")
    .update({ follow_up_status: status })
    .eq("id", id);
  if (error) throw error;
}

export async function insertFollowUp(
  fu: Pick<FollowUpSchedule, "client_id" | "reminder_date" | "notes" | "follow_up_status">
): Promise<FollowUpSchedule> {
  const { data, error } = await supabase
    .from("follow_up_schedule")
    .insert(fu)
    .select("*, client:clients(*)")
    .single();
  if (error) throw error;
  return data as FollowUpSchedule;
}

// ── Content Calendar ──────────────────────────────────────────────────────────

export async function getContentCalendar(): Promise<ContentCalendarItem[]> {
  const { data, error } = await supabase
    .from("content_calendar")
    .select("*")
    .order("scheduled_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContentCalendarItem[];
}

export async function insertContentItem(
  item: Omit<ContentCalendarItem, "id" | "created_at">
): Promise<ContentCalendarItem> {
  const { data, error } = await supabase
    .from("content_calendar")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as ContentCalendarItem;
}

export async function updateContentItem(
  id: string,
  patch: Partial<Pick<ContentCalendarItem, "draft_content" | "status">>
): Promise<void> {
  const { error } = await supabase
    .from("content_calendar")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

// ── Content Library ───────────────────────────────────────────────────────────

export async function getContentLibrary(): Promise<ContentLibraryItem[]> {
  const { data, error } = await supabase
    .from("content_library")
    .select("*")
    .order("use_count", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentLibraryItem[];
}

export async function insertLibraryItem(
  item: Omit<ContentLibraryItem, "id" | "created_at">
): Promise<ContentLibraryItem> {
  const { data, error } = await supabase
    .from("content_library")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as ContentLibraryItem;
}

export async function updateLibraryItem(
  id: string,
  patch: Partial<Pick<ContentLibraryItem, "content" | "use_count">>
): Promise<void> {
  const { error } = await supabase
    .from("content_library")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}
