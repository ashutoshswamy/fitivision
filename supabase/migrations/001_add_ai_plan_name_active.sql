-- =============================================================
-- Migration: Add name and is_active columns to ai_plans
-- =============================================================
-- Run this in the Supabase SQL Editor after the initial schema.
-- Adds the ability for users to name and activate/deactivate saved plans.
-- =============================================================

-- Add name column for user-friendly labeling
alter table public.ai_plans
  add column if not exists name text default 'Untitled Plan';

-- Add is_active flag so the user can mark one plan as their current plan
alter table public.ai_plans
  add column if not exists is_active boolean default false;

-- Index for quickly finding the active plan
create index if not exists idx_ai_plans_active
  on public.ai_plans(user_id, is_active)
  where is_active = true;
