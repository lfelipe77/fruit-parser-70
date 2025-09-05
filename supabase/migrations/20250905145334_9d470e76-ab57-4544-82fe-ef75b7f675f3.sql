-- Enforce canonical format for tickets.numbers: exactly 5 pairs of two-digit strings
-- Create an immutable validator function and (re)create the CHECK constraint

-- 1) Validator function (IMMUTABLE so it can be used in CHECK)
CREATE OR REPLACE FUNCTION public.is_ticket_numbers_5pairs(n jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    jsonb_typeof(n) = 'array'
    AND jsonb_array_length(n) = 5
    AND (
      SELECT bool_and(
        jsonb_typeof(elem) = 'array'
        AND jsonb_array_length(elem) = 2
        AND (elem->>0) ~ '^\d{2}$'
        AND (elem->>1) ~ '^\d{2}$'
      )
      FROM jsonb_array_elements(n) AS elem
    );
$$;

-- 2) Drop previous constraint if any, and create the new one (NOT VALID so existing rows won't block it)
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS ck_tickets_numbers_5pairs;
ALTER TABLE public.tickets
  ADD CONSTRAINT ck_tickets_numbers_5pairs
  CHECK (public.is_ticket_numbers_5pairs(numbers)) NOT VALID;