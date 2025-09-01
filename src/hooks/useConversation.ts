import { useCallback, useEffect, useRef, useState } from 'react';
import { getOrCreateConversationWith, fetchMessages, sendMessage, subscribeToConversation } from '@/lib/messages';

export function useConversation(targetUserId: string) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef<null | (() => void)>(null);

  const open = useCallback(async () => {
    setLoading(true);
    try {
      const id = await getOrCreateConversationWith(targetUserId);
      setConversationId(id);
      const initial = await fetchMessages(id, 100, 0);
      setMessages(initial);
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = subscribeToConversation(id, (row) => {
        setMessages((prev) => [...prev, row]);
      });
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const send = useCallback(async (text: string) => {
    if (!conversationId) return;
    await sendMessage(conversationId, text);
  }, [conversationId]);

  useEffect(() => () => { if (unsubRef.current) unsubRef.current(); }, []);

  return { conversationId, messages, loading, open, send };
}