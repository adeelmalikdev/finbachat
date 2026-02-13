-- Budget Simulator sessions
CREATE TABLE public.budget_sim_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  monthly_income NUMERIC NOT NULL DEFAULT 0,
  current_month INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress',
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  behavior_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.budget_sim_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own budget sessions" ON public.budget_sim_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budget sessions" ON public.budget_sim_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budget sessions" ON public.budget_sim_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Monthly records within a session
CREATE TABLE public.budget_sim_months (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.budget_sim_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  month_number INTEGER NOT NULL,
  allocations JSONB NOT NULL DEFAULT '{}'::jsonb,
  life_event JSONB,
  balance_before NUMERIC NOT NULL DEFAULT 0,
  balance_after NUMERIC NOT NULL DEFAULT 0,
  savings_total NUMERIC NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_sim_months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own budget months" ON public.budget_sim_months FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budget months" ON public.budget_sim_months FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add behavior_type to user_progress for behavioral classification
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS behavior_type TEXT;

-- Make leaderboard data readable: allow users to read other users' progress (XP/level only via view)
-- We'll query user_progress directly since it has RLS — we need a public leaderboard policy
CREATE POLICY "Anyone can read progress for leaderboard" ON public.user_progress FOR SELECT USING (true);

-- Drop the restrictive policy first
DROP POLICY IF EXISTS "Users can read own progress" ON public.user_progress;