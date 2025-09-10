import { supabase } from '@/integrations/supabase/client';

export async function sendAppEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  // Validate inputs
  if (!to || !subject || !html) {
    throw new Error('Missing required email parameters');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error('Invalid email address');
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: to.trim(),
        subject: subject.trim(),
        html,
        text: text || ''
      }
    });

    if (error) {
      console.error('Error invoking email function:', error);
      throw error;
    }

    if (!data?.ok) {
      console.error('Email send failed:', data?.error);
      throw new Error(data?.error || 'Failed to send email');
    }

    console.log('Email sent successfully:', data.messageId);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}