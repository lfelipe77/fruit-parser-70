import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { FLAGS } from '@/config/flags';

export interface Notification {
  id: string;
  user_id: string;
  type: 'nova_rifa' | 'rifa_finalizada' | 'sorteio_proximo' | 'organizador_seguido' | 'ticket_purchased' | 'winner_selected';
  title: string;
  message: string;
  data: any;
  read_at: string | null;
  created_at: string;
}

export function useNotifications(userId?: string) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  // Use provided userId or fall back to current user, but only if feature flag is enabled
  const effectiveUserId = FLAGS.notifications ? (userId || user?.id) : undefined;
  const enabled = FLAGS.notifications && !!effectiveUserId;

  const query = useQuery({
    queryKey: ['notifications', effectiveUserId],
    enabled,
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', effectiveUserId!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    staleTime: 30_000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!enabled || !effectiveUserId) return;
    
    const channel = supabase
      .channel(`notif:${effectiveUserId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${effectiveUserId}` 
        },
        () => queryClient.invalidateQueries({ queryKey: ['notifications', effectiveUserId] })
      )
      .subscribe();
    
    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [enabled, effectiveUserId, queryClient]);

  const unreadCount = useMemo(
    () => (query.data?.filter(n => !n.read_at).length ?? 0),
    [query.data]
  );

  return {
    ...query,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}

// Standalone helper functions
export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
}