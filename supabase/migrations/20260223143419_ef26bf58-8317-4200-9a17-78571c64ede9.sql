
-- Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS age_range text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS employment_status text,
  ADD COLUMN IF NOT EXISTS income_range text,
  ADD COLUMN IF NOT EXISTS financial_goals text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS content_preference text DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS daily_goal_minutes integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS preferred_difficulty text DEFAULT 'mixed',
  ADD COLUMN IF NOT EXISTS notify_streak boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_weekly boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_content boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_badges boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_leaderboard boolean DEFAULT false;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
