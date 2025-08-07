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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Log audit events for auth changes
        if (event === 'SIGNED_IN' && session) {
          // Log successful login
          setTimeout(async () => {
            try {
              // Determine login method based on provider or default to email
              const loginMethod = session.user.app_metadata?.provider || 'email';
              
              await supabase.rpc('log_audit_event', {
                action: 'logged_in',
                context: {
                  page: window.location.pathname || 'Login',
                  user_agent: navigator.userAgent,
                  login_method: loginMethod,
                  user_email: session.user.email
                }
              });
            } catch (error) {
              console.error('Error logging login audit event:', error);
            }
          }, 0);
          
          navigate('/dashboard');
          toast.success('Login realizado com sucesso!');
        }

        if (event === 'SIGNED_OUT') {
          // Log logout event
          setTimeout(async () => {
            try {
              await supabase.rpc('log_audit_event', {
                action: 'logged_out',
                context: {
                  page: window.location.pathname || 'Logout',
                  user_agent: navigator.userAgent
                }
              });
            } catch (error) {
              console.error('Error logging logout audit event:', error);
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

      // Note: The audit log will be handled by the onAuthStateChange listener
      // when the user successfully authenticates
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

      // Note: The audit log will be handled by the onAuthStateChange listener
      // when the user successfully authenticates
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