import React, { useState } from 'react';
import { useConversation } from '@/hooks/useConversation';

export function MessageButton({ targetUserId }: { targetUserId: string }) {
  const { conversationId, messages, loading, open, send } = useConversation(targetUserId);
  const [draft, setDraft] = useState('');

  return (
    <div className="flex flex-col gap-2">
      <button onClick={open} disabled={loading} className="px-3 py-2 rounded-lg border">
        {conversationId ? 'Abrir conversa' : 'Enviar mensagem'}
      </button>

      {conversationId && (
        <div className="rounded-lg border p-2 max-w-md">
          <div className="h-48 overflow-auto space-y-1 mb-2">
            {messages.map(m => (
              <div key={m.id} className="text-sm">
                <span className="opacity-60">{new Date(m.created_at).toLocaleTimeString()} • </span>
                <span>{m.content}</span>
              </div>
            ))}
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            await send(draft);
            setDraft('');
          }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Sua mensagem…"
              className="w-full border rounded-md px-2 py-1"
              maxLength={5000}
            />
          </form>
        </div>
      )}
    </div>
  );
}