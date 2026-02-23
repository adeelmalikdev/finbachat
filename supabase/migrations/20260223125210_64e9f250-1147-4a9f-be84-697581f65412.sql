-- Fix counter functions: switch to SECURITY DEFINER with validation

CREATE OR REPLACE FUNCTION public.increment_views(_content_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.expert_content 
  SET views_count = views_count + 1 
  WHERE id = _content_id 
    AND status = 'approved';
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_likes(_content_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment if user has a like record for this content
  IF NOT EXISTS (
    SELECT 1 FROM public.content_likes 
    WHERE content_id = _content_id AND user_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  UPDATE public.expert_content 
  SET likes_count = likes_count + 1 
  WHERE id = _content_id 
    AND status = 'approved';
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_likes(_content_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.expert_content 
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = _content_id 
    AND status = 'approved';
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.increment_views FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_likes FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_likes FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.increment_views TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_likes TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_likes TO authenticated;