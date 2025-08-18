-- Add direct_purchase_link column if it doesn't exist
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS direct_purchase_link text;