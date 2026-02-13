
-- Add difficulty column to questions table
ALTER TABLE public.questions ADD COLUMN difficulty text NOT NULL DEFAULT 'medium';

-- Update existing questions with varied difficulties
UPDATE public.questions SET difficulty = 'easy' WHERE order_index <= 3;
UPDATE public.questions SET difficulty = 'medium' WHERE order_index > 3 AND order_index <= 7;
UPDATE public.questions SET difficulty = 'hard' WHERE order_index > 7;
