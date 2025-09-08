import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminHealth() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-health-snapshot');
      setData(data ?? null);
      setError(error ?? null);
      setLoading(false);
    })();
  }, []);

  return { data, error, loading };
}