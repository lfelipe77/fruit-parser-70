// src/lib/notify.ts
import { supabase } from '@/integrations/supabase/client';

export async function pushNotification(payload: {
  user_id: string;
  type: 'ticket_purchased' | 'winner_selected' | 'raffle_completed' | 'raffle_hot' | 'generic';
  title: string;
  message?: string;
  dedupe_key?: string;
  data?: Record<string, any>;
}) {
  const { error } = await supabase.from('notifications').insert({
    user_id: payload.user_id,
    type: payload.type,
    title: payload.title,
    message: payload.message ?? '',
    dedupe_key: payload.dedupe_key ?? null,
    data: payload.data ?? {},
  });
  if (error) console.error('notify error', error);
}