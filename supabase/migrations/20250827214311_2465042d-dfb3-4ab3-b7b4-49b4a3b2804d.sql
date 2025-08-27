-- Update existing raffles to set published = true for active ones
UPDATE public.raffles 
SET published = true 
WHERE status = 'active' AND published IS NOT true;