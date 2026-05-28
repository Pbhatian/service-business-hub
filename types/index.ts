export type ClientTag =
  | "high-value" | "new" | "inactive" | "vip" | "referral"
  | "follow-up" | "prospect" | "active" | "churned";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tags: ClientTag[];
  notes: string;
  last_contact_date: string | null;
  created_at: string;
  service_type?: string;
}

export interface MessageLog {
  id: string;
  client_id: string;
  message_type: "outreach" | "re-engagement" | "follow-up" | "check-in" | "upsell" | "referral";
  draft_content: string;
  sent_status: "draft" | "sent" | "scheduled";
  created_at: string;
  client?: Client;
}

export interface ContentCalendarItem {
  id: string;
  post_type: "instagram" | "linkedin" | "blog" | "newsletter" | "twitter";
  draft_content: string;
  topic: string;
  scheduled_date: string;
  status: "draft" | "scheduled" | "published";
  created_at: string;
}

export interface FollowUpSchedule {
  id: string;
  client_id: string;
  reminder_date: string;
  follow_up_status: "pending" | "completed" | "snoozed";
  notes?: string;
  created_at: string;
  client?: Client;
}

export interface ContentLibraryItem {
  id: string;
  title: string;
  content: string;
  category: "outreach" | "social" | "email" | "template" | "blog";
  tags: string[];
  performance_notes?: string;
  use_count: number;
  created_at: string;
}

export interface DashboardStats {
  total_clients: number;
  active_clients: number;
  overdue_followups: number;
  drafts_pending: number;
  content_scheduled: number;
}
