
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import CancelRifaModal from "./CancelRifaModal";

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
    // TODO: Implement when Supabase is connected
    // This will:
    // 1. Update ganhavel status to 'cancelled' in database
    // 2. Process refunds for all participants
    // 3. Send notification emails with the reason
    // 4. Update user's ganhavel list
    
    console.log("Canceling ganhavel:", { ganhaveisId, reason, participantCount });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
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
