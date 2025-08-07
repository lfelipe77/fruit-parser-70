import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  type: string;
  description: string;
  ip_address?: string | null;
  user_id?: string | null;
  context: any;
  severity: string; // Will be properly typed by Supabase
  status: string; // Will be properly typed by Supabase
  created_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

interface SecurityStats {
  activeAlerts: number;
  criticalAlerts: number;
  loginAbuseAlerts: number;
  raffleSpamAlerts: number;
  suspiciousActionAlerts: number;
}

export const useSecurityAlerts = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    activeAlerts: 0,
    criticalAlerts: 0,
    loginAbuseAlerts: 0,
    raffleSpamAlerts: 0,
    suspiciousActionAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching security alerts:', error);
        return;
      }

      setAlerts(data || []);
      
      // Calculate stats
      const newStats = {
        activeAlerts: data?.filter(alert => alert.status === 'active').length || 0,
        criticalAlerts: data?.filter(alert => alert.severity === 'critical' && alert.status === 'active').length || 0,
        loginAbuseAlerts: data?.filter(alert => alert.type === 'login_abuse' && alert.status === 'active').length || 0,
        raffleSpamAlerts: data?.filter(alert => alert.type === 'raffle_spam' && alert.status === 'active').length || 0,
        suspiciousActionAlerts: data?.filter(alert => alert.type === 'suspicious_action' && alert.status === 'active').length || 0
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: 'investigated' | 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          status, 
          resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null 
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error updating alert status:', error);
        toast.error('Erro ao atualizar status do alerta');
        return;
      }

      toast.success('Status do alerta atualizado com sucesso');
      await fetchAlerts(); // Refresh data
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Erro ao atualizar alerta');
    }
  };

  const runSecurityChecks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: { action: 'run_checks' }
      });

      if (error) {
        console.error('Error running security checks:', error);
        toast.error('Erro ao executar verificações de segurança');
        return;
      }

      toast.success('Verificações de segurança executadas com sucesso');
      await fetchAlerts(); // Refresh data
    } catch (error) {
      console.error('Error running security checks:', error);
      toast.error('Erro ao executar verificações de segurança');
    }
  };

  const createManualAlert = async (
    type: string, 
    description: string, 
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context: any = {}
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: { 
          action: 'create_alert',
          type,
          description,
          severity,
          context
        }
      });

      if (error) {
        console.error('Error creating manual alert:', error);
        toast.error('Erro ao criar alerta manual');
        return;
      }

      toast.success('Alerta criado com sucesso');
      await fetchAlerts(); // Refresh data
    } catch (error) {
      console.error('Error creating manual alert:', error);
      toast.error('Erro ao criar alerta manual');
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscription for security alerts
    const channel = supabase
      .channel('security_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_alerts'
        },
        () => {
          fetchAlerts(); // Refresh when alerts change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    stats,
    loading,
    fetchAlerts,
    updateAlertStatus,
    runSecurityChecks,
    createManualAlert
  };
};