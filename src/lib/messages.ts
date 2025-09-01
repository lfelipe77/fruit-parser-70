import { supabase } from '@/lib/supabase';
import type { MessageRow } from '@/types/db-local';
const sb = supabase as any;

export async function getOrCreateConversationWith(targetUserId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user?.id;
  if (!me) throw new Error('Not signed in');
  const { data, error } = await sb.rpc('get_or_create_conversation', { user1: me, user2: targetUserId });
  if (error) throw error;
  return data as string;
}

export async function sendMessage(conversationId: string, content: string) {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user?.id;
  if (!me) throw new Error('Not signed in');
  if (!content?.trim()) return;
  const { error } = await sb
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: me, content: content.trim() });
  if (error) throw error;
}

export async function fetchMessages(conversationId: string, limit = 100, offset = 0) {
  const { data, error } = await sb
    .from('messages')
    .select('id,sender_id,content,created_at,read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as MessageRow[];
}

export function subscribeToConversation(conversationId: string, onNew: (row: any) => void) {
  const channel = supabase
    .channel(`conv:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => onNew(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}