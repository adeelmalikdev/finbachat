
-- Recreate leaderboard_view WITHOUT security_invoker so all users are visible
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE VIEW public.leaderboard_view
WITH (security_invoker = false) AS
SELECT
  up.user_id,
  up.xp,
  up.level,
  up.badges_earned,
  p.display_name,
  p.avatar_url
FROM user_progress up
JOIN profiles p ON p.id = up.user_id
ORDER BY up.xp DESC;

-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;
