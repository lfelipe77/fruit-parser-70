import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminHealth() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Mock data until RPC function is created
        const mockData = {
          flip_candidates: 0,
          pick_candidates: 0,
          last_caixa: { draw_date: '—', numbers: [], concurso: '—' },
          last_picker_run: { last_pick_at: '—', provider: '—', picks_today: 0 }
        };
        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, error, loading };
}