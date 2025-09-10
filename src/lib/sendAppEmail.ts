import { supabase } from '@/integrations/supabase/client';

export async function sendAppEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        html,
        text
      }
    });

    if (error) {
      console.error('Error sending email:', error);
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