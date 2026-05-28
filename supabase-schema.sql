-- Service Business Hub — Supabase Schema
-- Run this in your Supabase SQL Editor to create all tables.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Clients ──────────────────────────────────────────────────────────────────
create table if not exists clients (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  email            text not null unique,
  phone            text,
  company          text,
  service_type     text,
  tags             text[] default '{}',
  notes            text default '',
  last_contact_date date,
  created_at       timestamptz default now()
);

-- ── Message Logs ─────────────────────────────────────────────────────────────
create table if not exists message_logs (
  id             uuid primary key default uuid_generate_v4(),
  client_id      uuid references clients(id) on delete cascade,
  message_type   text check (message_type in ('outreach','follow-up','check-in','upsell','referral')),
  draft_content  text not null,
  sent_status    text check (sent_status in ('draft','sent','scheduled')) default 'draft',
  created_at     timestamptz default now()
);

-- ── Content Calendar ─────────────────────────────────────────────────────────
create table if not exists content_calendar (
  id              uuid primary key default uuid_generate_v4(),
  post_type       text check (post_type in ('instagram','linkedin','blog','newsletter','twitter')),
  draft_content   text not null,
  topic           text not null,
  scheduled_date  date not null,
  status          text check (status in ('draft','scheduled','published')) default 'draft',
  created_at      timestamptz default now()
);

-- ── Follow-Up Schedule ───────────────────────────────────────────────────────
create table if not exists follow_up_schedule (
  id                 uuid primary key default uuid_generate_v4(),
  client_id          uuid references clients(id) on delete cascade,
  reminder_date      date not null,
  follow_up_status   text check (follow_up_status in ('pending','completed','snoozed')) default 'pending',
  notes              text,
  created_at         timestamptz default now()
);

-- ── Content Library ──────────────────────────────────────────────────────────
create table if not exists content_library (
  id                 uuid primary key default uuid_generate_v4(),
  title              text not null,
  content            text not null,
  category           text check (category in ('outreach','social','email','template','blog')),
  tags               text[] default '{}',
  performance_notes  text,
  use_count          integer default 0,
  created_at         timestamptz default now()
);

-- Row Level Security (optional — enable if you add auth)
-- alter table clients enable row level security;
-- alter table message_logs enable row level security;
-- alter table content_calendar enable row level security;
-- alter table follow_up_schedule enable row level security;
-- alter table content_library enable row level security;
