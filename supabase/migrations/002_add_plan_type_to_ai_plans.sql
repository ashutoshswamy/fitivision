-- =============================================================
-- Migration: Add plan_type column to ai_plans
-- =============================================================
-- Run this in the Supabase SQL Editor.
-- Distinguishes workout plans from meal plans in the same table.
-- =============================================================

-- Add plan_type column: 'workout' (default for existing rows) or 'meal'
alter table public.ai_plans
  add column if not exists plan_type text default 'workout'
  check (plan_type in ('workout', 'meal'));

-- Index for filtering plans by type
create index if not exists idx_ai_plans_user_type
  on public.ai_plans(user_id, plan_type);
