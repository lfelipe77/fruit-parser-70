import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendAppEmail } from '@/lib/sendAppEmail';
import { welcomeEmail } from '@/lib/emailTemplates';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  initializing: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [welcomeEmailChecked, setWelcomeEmailChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        console.log('[AuthProvider] Auth state change:', event, session?.user?.id || 'no-user');
        
        // Only update state synchronously - no navigation on auth events
        setSession(session);
        setUser(session?.user ?? null);
        setInitializing(false);

        // Handle welcome email for authenticated users (avoid duplicate calls)
        if (session?.user && !welcomeEmailChecked) {
          setWelcomeEmailChecked(true);
          setTimeout(() => {
            handleWelcomeEmail(session.user);
          }, 0);
        }
        
        // Reset flag when user logs out
        if (!session?.user) {
          setWelcomeEmailChecked(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      console.log('[AuthProvider] Initial session:', session?.user?.id || 'no-session');
      setSession(session);
      setUser(session?.user ?? null);
      setInitializing(false);
      
      // Check welcome email for existing sessions too
      if (session?.user && !welcomeEmailChecked) {
        setWelcomeEmailChecked(true);
        setTimeout(() => {
          handleWelcomeEmail(session.user);
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleWelcomeEmail = async (user: User) => {
    if (!user?.email) {
      console.warn('No user email available for welcome email');
      return;
    }

    try {
      // Check if welcome email already sent
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, welcome_sent_at')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile for welcome email:', profileError);
        return;
      }

      // Atomic "send once" guard
      const { data: claim, error: claimError } = await supabase
        .from('user_profiles')
        .update({ welcome_sent_at: new Date().toISOString() })
        .eq('id', user.id)
        .is('welcome_sent_at', null)
        .select('id');

      if (claimError) {
        console.error('Error claiming welcome email send:', claimError);
        return;
      }
      if (!claim || claim.length === 0) {
        return; // already sent or claimed elsewhere
      }

      try {
        const parts = welcomeEmail({
          name: profile?.full_name || 'Ganhavel',
          myTicketsUrl: `${window.location.origin}/#/minha-conta?tab=bilhetes`,
          resultsUrl: `${window.location.origin}/#/resultados`
        });
        await sendAppEmail(user.email, parts.subject, parts.html, parts.text);
        console.log('Welcome email sent successfully to:', user.email);
      } catch (e) {
        console.error('Welcome email send failed, reverting claim:', e);
        await supabase
          .from('user_profiles')
          .update({ welcome_sent_at: null })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw - just log the error so auth flow continues
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);