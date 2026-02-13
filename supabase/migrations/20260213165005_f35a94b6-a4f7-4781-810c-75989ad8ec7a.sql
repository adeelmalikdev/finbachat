
-- Fix search_path on counter functions
ALTER FUNCTION public.increment_views(_content_id UUID) SET search_path = public;
ALTER FUNCTION public.increment_likes(_content_id UUID) SET search_path = public;
ALTER FUNCTION public.decrement_likes(_content_id UUID) SET search_path = public;
