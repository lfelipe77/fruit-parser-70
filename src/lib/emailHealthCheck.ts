import { supabase } from '@/integrations/supabase/client';

/**
 * Health check utilities for email functionality
 */
export const EmailHealthCheck = {
  /**
   * Test if email service is working
   */
  async testEmailService(): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'test@example.com',
          subject: 'Test Email Service',
          html: '<p>Service test</p>',
          text: 'Service test'
        }
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      return { ok: !!data?.ok, error: data?.error };
    } catch (error) {
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Check if user has pending welcome email
   */
  async checkWelcomeEmailStatus(userId: string): Promise<{ 
    needsWelcome: boolean; 
    profile?: any; 
    error?: string 
  }> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, welcome_sent_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        return { needsWelcome: false, error: error.message };
      }

      return { 
        needsWelcome: profile && !profile.welcome_sent_at,
        profile
      };
    } catch (error) {
      return { 
        needsWelcome: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Check database columns exist
   */
  async verifyEmailColumns(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = [];

    try {
      // Test welcome_sent_at column
      const { error: profileError } = await supabase
        .from('user_profiles')
        .select('welcome_sent_at')
        .limit(1);

      if (profileError) missing.push('user_profiles.welcome_sent_at');

      // Test receipt_email_sent_at column
      const { error: txError } = await supabase
        .from('transactions')
        .select('receipt_email_sent_at')
        .limit(1);

      if (txError) missing.push('transactions.receipt_email_sent_at');

      // Test launch_email_sent_at column
      const { error: raffleError } = await supabase
        .from('raffles')
        .select('launch_email_sent_at')
        .limit(1);

      if (raffleError) missing.push('raffles.launch_email_sent_at');

      return { ok: missing.length === 0, missing };
    } catch (error) {
      return { ok: false, missing: ['Database connection failed'] };
    }
  }
};