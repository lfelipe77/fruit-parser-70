
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import CancelRifaModal from "./CancelRifaModal";
import { supabase } from "@/integrations/supabase/client";

interface GanhavesCancelButtonProps {
  ganhaveisId: string;
  ganhaveisTitle: string;
  participantCount?: number;
  isOwner?: boolean;
  status?: "active" | "completed" | "cancelled";
}

export default function GanhavesCancelButton({
  ganhaveisId,
  ganhaveisTitle,
  participantCount = 0,
  isOwner = false,
  status = "active"
}: GanhavesCancelButtonProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelGanhavel = async (reason: string) => {
    try {
      // Log audit event for raffle cancellation
      const { data: authUser } = await supabase.auth.getUser();
      await supabase.rpc('log_audit_event_json', {
        payload: {
          action: 'cancelled_raffle',
          context: {
            raffle_id: ganhaveisId,
            cancellation_reason: reason,
            participant_count: participantCount,
            page: 'GerenciarGanhavel',
            action_type: 'cancellation'
          },
          actor_id: authUser?.user?.id || null
        }
      });

      // TODO: Implement when Supabase is connected
      // This will:
      // 1. Update ganhavel status to 'cancelled' in database
      // 2. Process refunds for all participants
      // 3. Send notification emails with the reason
      // 4. Update user's ganhavel list
      
      console.log("Canceling ganhavel:", { ganhaveisId, reason, participantCount });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error cancelling raffle:', error);
    }
  };

  // Only show cancel button if user is owner and ganhavel is active
  if (!isOwner || status !== "active") {
    return null;
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowCancelModal(true)}
        className="flex items-center gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        Cancelar Ganhavel
      </Button>

      <CancelRifaModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        rifaTitle={ganhaveisTitle}
        participantCount={participantCount}
        onConfirmCancel={handleCancelGanhavel}
      />
    </>
  );
}
