
-- Create video_lessons table
CREATE TABLE public.video_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  youtube_url text NOT NULL,
  youtube_id text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  duration text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Beginner',
  added_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view videos
CREATE POLICY "Anyone can read video lessons"
  ON public.video_lessons FOR SELECT
  USING (true);

-- Only experts and admins can insert
CREATE POLICY "Experts and admins can insert videos"
  ON public.video_lessons FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'expert') OR has_role(auth.uid(), 'admin')
  );

-- Only experts (own) and admins can delete
CREATE POLICY "Experts can delete own, admins can delete any"
  ON public.video_lessons FOR DELETE
  USING (
    added_by = auth.uid() OR has_role(auth.uid(), 'admin')
  );

-- Only experts (own) and admins can update
CREATE POLICY "Experts can update own, admins can update any"
  ON public.video_lessons FOR UPDATE
  USING (
    added_by = auth.uid() OR has_role(auth.uid(), 'admin')
  );
