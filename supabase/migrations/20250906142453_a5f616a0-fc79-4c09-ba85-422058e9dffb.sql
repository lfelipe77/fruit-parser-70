-- Fix tickets table constraints - keep only the 5singles constraint which matches our data format
-- Drop the conflicting 5pairs constraint since we're using 5singles format
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS ck_tickets_numbers_5pairs;

-- Ensure the 5singles constraint is valid and enabled
ALTER TABLE public.tickets VALIDATE CONSTRAINT ck_tickets_numbers_5singles;