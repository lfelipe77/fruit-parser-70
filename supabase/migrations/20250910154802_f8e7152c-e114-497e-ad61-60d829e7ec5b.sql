-- Add email tracking columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS welcome_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add email tracking columns to transactions table  
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS receipt_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add email tracking columns to raffles table
ALTER TABLE public.raffles
ADD COLUMN IF NOT EXISTS launch_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;