
-- Fix user_progress: restrict full data to owner, create safe leaderboard view

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read progress for leaderboard" ON public.user_progress;

-- Users can only read their own full progress
CREATE POLICY "Users can read own progress"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Create a safe leaderboard view exposing only non-sensitive fields
CREATE OR REPLACE VIEW public.leaderboard_view
WITH (security_invoker=on) AS
SELECT 
  up.user_id,
  up.xp,
  up.level,
  up.badges_earned,
  p.display_name,
  p.avatar_url
FROM public.user_progress up
JOIN public.profiles p ON p.id = up.user_id
ORDER BY up.xp DESC;
