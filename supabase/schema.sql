-- ==============================================================================
-- DawaCard Lite — Supabase PostgreSQL Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Medications Table
create table if not exists public.medications (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  strength text,
  dosage_form text,
  prescribed_instructions text,
  route text,
  frequency text,
  duration text,
  times_of_day text[] default '{}',
  start_date text,
  end_date text,
  status text not null default 'current',
  notes text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create Allergies Table
create table if not exists public.allergies (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  allergen text not null,
  reported_reaction text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create Patient Profiles Table (stores patient info & allergy status)
create table if not exists public.patient_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  date_of_birth text,
  notes text,
  allergy_status text not null default 'unknown',
  updated_at timestamptz not null default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.medications enable row level security;
alter table public.allergies enable row level security;
alter table public.patient_profiles enable row level security;

-- 5. Row Level Security Policies: Medications
drop policy if exists "Users can view own medications" on public.medications;
create policy "Users can view own medications"
  on public.medications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own medications" on public.medications;
create policy "Users can insert own medications"
  on public.medications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own medications" on public.medications;
create policy "Users can update own medications"
  on public.medications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own medications" on public.medications;
create policy "Users can delete own medications"
  on public.medications for delete
  using (auth.uid() = user_id);

-- 6. Row Level Security Policies: Allergies
drop policy if exists "Users can view own allergies" on public.allergies;
create policy "Users can view own allergies"
  on public.allergies for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own allergies" on public.allergies;
create policy "Users can insert own allergies"
  on public.allergies for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own allergies" on public.allergies;
create policy "Users can update own allergies"
  on public.allergies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own allergies" on public.allergies;
create policy "Users can delete own allergies"
  on public.allergies for delete
  using (auth.uid() = user_id);

-- 7. Row Level Security Policies: Patient Profiles
drop policy if exists "Users can view own profile" on public.patient_profiles;
create policy "Users can view own profile"
  on public.patient_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.patient_profiles;
create policy "Users can insert own profile"
  on public.patient_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.patient_profiles;
create policy "Users can update own profile"
  on public.patient_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own profile" on public.patient_profiles;
create policy "Users can delete own profile"
  on public.patient_profiles for delete
  using (auth.uid() = user_id);

-- 8. Fast Lookup Indexes
create index if not exists idx_medications_user_status on public.medications(user_id, status);
create index if not exists idx_medications_user_updated on public.medications(user_id, updated_at desc);
create index if not exists idx_allergies_user on public.allergies(user_id);
