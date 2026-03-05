-- =============================================================
-- FitVision — Supabase Schema
-- =============================================================
-- Run this in the Supabase SQL Editor to create all tables.
-- Clerk handles auth; we store the Clerk user ID as `user_id`.
-- =============================================================

-- 1. PROFILES ─ extended user profile linked to Clerk
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id            uuid default gen_random_uuid() primary key,
  user_id       text not null unique,           -- Clerk user ID (e.g. user_2abc...)
  display_name  text,
  age           int,
  gender        text,
  height_cm     numeric(5,1),
  weight_kg     numeric(5,1),
  fitness_level text check (fitness_level in ('Beginner','Intermediate','Advanced')),
  goals         text[],                         -- array of goal strings
  conditions    text,                           -- pre-existing conditions
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. WORKOUT_SESSIONS ─ one row per workout session
-- ---------------------------------------------------------
create table if not exists public.workout_sessions (
  id            uuid default gen_random_uuid() primary key,
  user_id       text not null,                  -- Clerk user ID
  started_at    timestamptz default now(),
  ended_at      timestamptz,
  duration_sec  int,                            -- total duration in seconds
  notes         text,
  source        text default 'manual' check (source in ('manual','ai_plan')),
  ai_plan_id    uuid,                           -- FK to ai_plans if source = 'ai_plan'
  created_at    timestamptz default now()
);

-- 3. WORKOUT_EXERCISES ─ each exercise logged within a session
-- ---------------------------------------------------------
create table if not exists public.workout_exercises (
  id              uuid default gen_random_uuid() primary key,
  session_id      uuid not null references public.workout_sessions(id) on delete cascade,
  user_id         text not null,                -- denormalized for easy queries
  exercise_type   text not null,                -- e.g. 'Squats', 'Pushups'
  sets_completed  int default 1,
  reps_completed  int default 0,
  target_reps     int,
  precision_avg   numeric(5,2),                 -- average precision %
  duration_sec    int,                          -- time spent on this exercise
  notes           text,
  created_at      timestamptz default now()
);

-- 4. AI_PLANS ─ saved AI-generated workout plans
-- ---------------------------------------------------------
create table if not exists public.ai_plans (
  id            uuid default gen_random_uuid() primary key,
  user_id       text not null,                  -- Clerk user ID
  name          text default 'Untitled Plan',   -- user-friendly label
  form_data     jsonb not null,                 -- the form input sent to Gemini
  plan_data     jsonb not null,                 -- the full AI response
  summary       text,
  is_active     boolean default false,           -- user's current active plan
  created_at    timestamptz default now()
);

-- FK: workout_sessions.ai_plan_id → ai_plans.id
alter table public.workout_sessions
  add constraint fk_workout_sessions_ai_plan
  foreign key (ai_plan_id) references public.ai_plans(id) on delete set null;

-- =============================================================
-- INDEXES
-- =============================================================
create index if not exists idx_profiles_user_id           on public.profiles(user_id);
create index if not exists idx_workout_sessions_user_id   on public.workout_sessions(user_id);
create index if not exists idx_workout_sessions_started   on public.workout_sessions(started_at desc);
create index if not exists idx_workout_exercises_session   on public.workout_exercises(session_id);
create index if not exists idx_workout_exercises_user_id   on public.workout_exercises(user_id);
create index if not exists idx_ai_plans_user_id           on public.ai_plans(user_id);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
-- Enable RLS on all tables
alter table public.profiles          enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.ai_plans          enable row level security;

-- Since we use a service-role key on the server side and pass
-- the Clerk user_id explicitly, we create permissive policies
-- for the service role. If you use the anon key client-side,
-- add JWT-based policies matching auth.uid() to user_id.

-- Permissive policies for service role (bypass RLS automatically)
-- For anon key access, you'd add policies like:
--   create policy "Users can read own profiles"
--     on public.profiles for select
--     using (user_id = auth.jwt() ->> 'sub');

-- For now, allow service role full access (default with service key).
-- If using anon key from client, uncomment and adapt the policies below:

/*
-- Profiles
create policy "profiles_select_own" on public.profiles for select using (user_id = auth.jwt() ->> 'sub');
create policy "profiles_insert_own" on public.profiles for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "profiles_update_own" on public.profiles for update using (user_id = auth.jwt() ->> 'sub');

-- Workout Sessions
create policy "sessions_select_own" on public.workout_sessions for select using (user_id = auth.jwt() ->> 'sub');
create policy "sessions_insert_own" on public.workout_sessions for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "sessions_update_own" on public.workout_sessions for update using (user_id = auth.jwt() ->> 'sub');

-- Workout Exercises
create policy "exercises_select_own" on public.workout_exercises for select using (user_id = auth.jwt() ->> 'sub');
create policy "exercises_insert_own" on public.workout_exercises for insert with check (user_id = auth.jwt() ->> 'sub');

-- AI Plans
create policy "plans_select_own" on public.ai_plans for select using (user_id = auth.jwt() ->> 'sub');
create policy "plans_insert_own" on public.ai_plans for insert with check (user_id = auth.jwt() ->> 'sub');
*/
