import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CancelRifaModalProps {
  isOpen: boolean;
  onClose: () => void;
  rifaTitle: string;
  participantCount?: number;
  onConfirmCancel: (reason: string) => void;
}

export default function CancelRifaModal({
  isOpen,
  onClose,
  rifaTitle,
  participantCount = 0,
  onConfirmCancel
}: CancelRifaModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, informe o motivo do cancelamento.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onConfirmCancel(reason);
      toast({
        title: "Rifa cancelada",
        description: "Todos os participantes serão notificados e poderão transferir seus créditos para qualquer outro ganhaveis não sorteados na plataforma.",
      });
      onClose();
      setReason("");
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancelar Rifa
          </DialogTitle>
          <DialogDescription>
            Você está prestes a cancelar a rifa "{rifaTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              {participantCount > 0 
                ? `${participantCount} participante(s) poderão transferir seus créditos para qualquer outro ganhaveis não sorteados na plataforma.`
                : "Nenhum participante será afetado."
              }
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do cancelamento *</Label>
            <Textarea
              id="reason"
              placeholder="Explique o motivo do cancelamento. Esta mensagem será enviada para todos os participantes."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Voltar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}