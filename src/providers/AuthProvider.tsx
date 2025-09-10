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

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        console.log('[AuthProvider] Auth state change:', event, session?.user?.id || 'no-user');
        setSession(session);
        setUser(session?.user ?? null);
        setInitializing(false);

        // Handle welcome email after session is established
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            handleWelcomeEmail(session.user);
          }, 0);
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
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleWelcomeEmail = async (user: User) => {
    try {
      // Check if welcome email already sent
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, full_name, welcome_sent_at')
        .eq('id', user.id)
        .single();

      if (profile && !profile.welcome_sent_at) {
        const parts = welcomeEmail({
          name: profile.full_name || 'Ganhavel',
          myTicketsUrl: `${window.location.origin}/#/minha-conta?tab=bilhetes`,
          resultsUrl: `${window.location.origin}/#/resultados`
        });

        await sendAppEmail(user.email!, parts.subject, parts.html, parts.text);
        
        // Mark welcome email as sent
        await supabase
          .from('user_profiles')
          .update({ welcome_sent_at: new Date().toISOString() })
          .eq('id', user.id);

        console.log('Welcome email sent successfully to:', user.email);
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