-- Deal Command Center — initial schema (PRD §15)
-- Single-firm MVP; every row carries firm_id to allow future multi-firm without refactor.

create extension if not exists pgcrypto;

-- ---- enums (DATA-02) ----
do $$ begin
  create type project_type as enum ('sell', 'buy');
exception when duplicate_object then null; end $$;
do $$ begin
  create type project_status as enum ('prospect', 'active', 'onhold', 'closed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type step_status as enum ('notstarted', 'inprogress', 'completed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type doc_source as enum ('ai', 'uploaded');
exception when duplicate_object then null; end $$;
do $$ begin
  create type skill_format as enum ('docx', 'xlsx', 'pptx', 'pdf');
exception when duplicate_object then null; end $$;

-- ---- updated_at trigger ----
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---- firm ----
create table if not exists firm (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  address text,
  market_focus text,
  industry_specializations text,
  total_transactions text,
  geography text,
  description text,
  advisor_bio text,
  ai_instructions text check (char_length(ai_instructions) <= 2000),
  defaults jsonb not null default '{}'::jsonb,
  api_key_encrypted text,
  api_key_verified boolean not null default false,
  storage_limit_bytes bigint not null default 10737418240, -- 10 GB
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger firm_updated before update on firm
  for each row execute function set_updated_at();

-- ---- app_user ----
create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firm(id) on delete cascade,
  auth_id uuid unique,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  title text,
  years_experience text,
  created_at timestamptz not null default now()
);

-- ---- project ----
create table if not exists project (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firm(id) on delete cascade,
  company_name text not null,
  website text,
  industry text,
  location text,
  type project_type not null,
  track text not null,
  status project_status not null default 'prospect',
  est_value text,
  ebitda text,
  multiple text,
  structure text,
  contact_name text,
  contact_title text,
  contact_phone text,
  engagement_start date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger project_updated before update on project
  for each row execute function set_updated_at();
create index if not exists project_firm_idx on project(firm_id);

-- ---- project_step ----
create table if not exists project_step (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id) on delete cascade,
  skill_key text not null,
  ordinal int not null,
  status step_status not null default 'notstarted',
  linked_document_id uuid,
  completed_at timestamptz,
  unique (project_id, skill_key)
);
create index if not exists step_project_idx on project_step(project_id);

-- ---- run + run_version ----
create table if not exists run (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id) on delete cascade,
  skill_key text not null,
  inputs jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
create index if not exists run_project_idx on run(project_id);

create table if not exists run_version (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references run(id) on delete cascade,
  version_no int not null,
  content_json jsonb not null,
  preview_md text,
  model_used text,
  tokens int,
  created_at timestamptz not null default now(),
  unique (run_id, version_no)
);

-- ---- document ----
create table if not exists document (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firm(id) on delete cascade,
  project_id uuid references project(id) on delete cascade,
  run_version_id uuid references run_version(id) on delete set null,
  source doc_source not null,
  skill_key text,
  filename text not null,
  format skill_format not null,
  storage_path text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists document_firm_idx on document(firm_id);
create index if not exists document_project_idx on document(project_id);

-- linked_document_id FK added after document exists
alter table project_step
  drop constraint if exists project_step_linked_document_fk;
alter table project_step
  add constraint project_step_linked_document_fk
  foreign key (linked_document_id) references document(id) on delete set null;

-- ---- activity_event ----
create table if not exists activity_event (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firm(id) on delete cascade,
  project_id uuid references project(id) on delete cascade,
  type text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_firm_idx on activity_event(firm_id, created_at desc);

-- ---- style_example ----
create table if not exists style_example (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firm(id) on delete cascade,
  skill_key text not null,
  document_id uuid references document(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (firm_id, skill_key)
);

-- ---- notification_pref ----
create table if not exists notification_pref (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firm(id) on delete cascade,
  key text not null,
  enabled boolean not null default true,
  unique (firm_id, key)
);

-- ---- RLS (DATA-04) ----
-- MVP single-user: permissive for authenticated role. Tighten to firm-membership
-- mapping when multi-user lands (deferred). Service role bypasses RLS for seed/migrations.
do $$
declare t text;
begin
  foreach t in array array[
    'firm','app_user','project','project_step','run','run_version',
    'document','activity_event','style_example','notification_pref'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy %I on %I for all to authenticated using (true) with check (true);',
      t || '_authenticated', t
    );
  end loop;
end $$;
