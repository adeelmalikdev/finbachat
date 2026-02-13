
-- Atomic counter functions for expert_content

CREATE OR REPLACE FUNCTION public.increment_views(_content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE public.expert_content 
  SET views_count = views_count + 1 
  WHERE id = _content_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_likes(_content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE public.expert_content 
  SET likes_count = likes_count + 1 
  WHERE id = _content_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_likes(_content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE public.expert_content 
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = _content_id;
END;
$$;
