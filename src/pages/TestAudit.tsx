import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";

// Temporary test page: calls get_my_audit_logs and logs the result
// Remove this file and its route after verifying results
export default function TestAudit() {
  const { isAdmin, loading } = useAdminCheck();

  useEffect(() => {
    if (loading) return;

    if (!isAdmin) {
      console.log("Not admin");
      return;
    }

    const run = async () => {
      const { data, error } = await (supabase.rpc as any)("get_my_audit_logs", {
        p_limit: 20,
        p_minutes: 1440,
        p_action: null,
      });
      console.log("get_my_audit_logs data:", data);
      console.log("get_my_audit_logs error:", error);
    };

    run();
  }, [isAdmin, loading]);

  return null;
}
