import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuditLogger } from './useAuditLogger';
import { withTimeout } from '@/lib/net';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logLogin, logLogout, logSignup } = useAuditLogger();

  useEffect(() => {
    // Immediately set loading to false - never block app startup
    setLoading(false);
    
    // Set up auth state listener (non-blocking)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Log audit events for auth changes with error handling
        if (event === 'SIGNED_IN' && session) {
          // Non-blocking audit logging
          setTimeout(() => {
            try {
              const loginMethod = session.user.app_metadata?.provider || 'email';
              logLogin(loginMethod as 'email' | 'google', true, session.user.email);
            } catch (error) {
              console.warn('Failed to log login event:', error);
            }
          }, 0);
          
          navigate('/dashboard');
          toast.success('Login realizado com sucesso!');
        }

        if (event === 'SIGNED_OUT') {
          // Non-blocking audit logging
          setTimeout(() => {
            try {
              logLogout();
            } catch (error) {
              console.warn('Failed to log logout event:', error);
            }
          }, 0);
        }
      }
    );

    // Check for existing session in background (non-blocking)
    setTimeout(() => {
      withTimeout(supabase.auth.getSession(), 1500, 'auth-session')
        .then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
        })
        .catch((error) => {
          console.warn('[auth:init] non-fatal', error);
          // Continue with null session - don't block
        });
    }, 0);

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/#/dashboard`
          }
        }),
        8000,
        'google-signin'
      );

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
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        8000,
        'email-signin'
      );

      if (error) {
        // Log failed login attempt (non-blocking)
        setTimeout(() => {
          try {
            logLogin('email', false, email);
          } catch (e) {
            console.warn('Failed to log failed login:', e);
          }
        }, 0);
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
      const redirectUrl = `${window.location.origin}/#/dashboard`;
      
      const { error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        }),
        8000,
        'signup'
      );

      if (error) {
        toast.error('Erro no cadastro: ' + error.message);
        return { error };
      }

      // Log successful signup (non-blocking)
      setTimeout(() => {
        try {
          logSignup(email, 'email');
        } catch (e) {
          console.warn('Failed to log signup:', e);
        }
      }, 0);
      toast.success('Verifique seu email para confirmar o cadastro!');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro no cadastro: ' + errorMessage);
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await withTimeout(supabase.auth.signOut(), 5000, 'signout');
      if (error) {
        toast.error('Erro ao sair: ' + error.message);
      } else {
        toast.success('Logout realizado com sucesso!');
        navigate('/');
      }
    } catch (error) {
      console.warn('Signout timeout, proceeding anyway');
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