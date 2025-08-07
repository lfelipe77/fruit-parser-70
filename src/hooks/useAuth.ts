
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    console.log('🔧 useAuth: Starting auth setup');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('🔧 Auth event:', event, 'Session:', !!session, 'User ID:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle navigation ONLY for successful login (not for initial session)
        if (event === 'SIGNED_IN' && session) {
          console.log('🔧 User signed in, redirecting to dashboard');
          // Defer navigation and other side effects
          setTimeout(() => {
            if (!isMounted) return;
            navigate('/dashboard');
            toast.success('Login realizado com sucesso!');
          }, 100);
        }

        if (event === 'SIGNED_OUT') {
          console.log('🔧 User signed out');
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        console.log('🔧 Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        if (error) {
          console.error('🔧 Error getting session:', error);
        }
        
        console.log('🔧 Initial session check:', !!session, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('🔧 Error in getInitialSession:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      console.log('🔧 useAuth: Cleaning up');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Removed navigate dependency to prevent loops

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast.error('Erro no login com Google: ' + error.message);
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro no login com Google: ' + errorMessage);
      return { error: errorMessage };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Erro no login: ' + error.message);
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro no login: ' + errorMessage);
      return { error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast.error('Erro no cadastro: ' + error.message);
        return { error };
      }

      toast.success('Verifique seu email para confirmar o cadastro!');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro no cadastro: ' + errorMessage);
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    // Log logout before actually signing out
    try {
      await supabase.rpc('log_audit_event', {
        action: 'logout_initiated',
        context: {
          page: window.location.pathname,
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Error logging logout audit event:', error);
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao sair: ' + error.message);
    } else {
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    }
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut
  };
};
