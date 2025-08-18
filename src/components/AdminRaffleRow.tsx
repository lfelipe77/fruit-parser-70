import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
   Eye,
   Check,
   Ban,
   AlertTriangle,
   Clock,
   CheckCircle,
   XCircle,
   Calendar,
   User,
   DollarSign,
   ExternalLink,
   Pause,
   Play,
   MessageSquare,
   Link,
   MapPin,
   Edit,
 } from "lucide-react";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { formatBRL } from "@/lib/formatters";
import { RafflePublicMoney } from "@/types/public-views";
import { useNavigate } from "react-router-dom";

interface AdminRaffleRowProps {
  raffle: RafflePublicMoney;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onVerifyAffiliate: (link: string) => void;
  onView?: (id: string) => void;
  onToggleStatus?: (row: any) => void;
}

export function AdminRaffleRow({ 
  raffle, 
  onApprove, 
  onReject, 
  onSuspend, 
  onReactivate, 
  onSaveNotes, 
  onVerifyAffiliate,
  onView,
  onToggleStatus
}: AdminRaffleRowProps) {
  // ✅ All hooks at the top
  const [selectedGanhavel, setSelectedGanhavel] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  
  const navigate = useNavigate();
  const lastPaidAgo = useRelativeTime(raffle.last_paid_at, "pt-BR");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "active":
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" />Ativa</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-200"><Check className="h-3 w-3 mr-1" />Concluída</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelada</Badge>;
      case "suspended":
        return <Badge variant="outline" className="text-red-600 border-red-200"><Ban className="h-3 w-3 mr-1" />Suspensa</Badge>;
      case "review":
        return <Badge variant="outline" className="text-purple-600 border-purple-200"><Eye className="h-3 w-3 mr-1" />Em Análise</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{raffle.title}</div>
          <div className="text-sm text-muted-foreground">
            {raffle.category_name}
          </div>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(raffle.status)}</TableCell>
      <TableCell>
        <div className="font-medium text-emerald-600">
          {formatBRL(raffle.amount_raised)}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {formatBRL(raffle.goal_amount)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {Math.round(raffle.progress_pct_money)}%
          </span>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full" 
              style={{ width: `${Math.min(100, raffle.progress_pct_money)}%` }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {lastPaidAgo}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedGanhavel(raffle)}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Ganhavel - {selectedGanhavel?.id}</DialogTitle>
                <DialogDescription>
                  Informações completas do ganhavel
                </DialogDescription>
              </DialogHeader>
              {selectedGanhavel && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Título</Label>
                      <p className="text-sm">{selectedGanhavel.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedGanhavel.status)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-notes">Observações Administrativas</Label>
                    <Textarea
                      id="admin-notes"
                      placeholder="Adicione observações sobre este ganhavel..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => onSaveNotes(selectedGanhavel?.id, adminNotes)}
                >
                  Salvar Observações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onView?.(raffle.id)}
          >
            <Eye className="h-3 w-3" />
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onToggleStatus?.(raffle)}
          >
            {raffle.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => navigate(`/admin/rifas?edit=${raffle.id}`)}
          >
            <Edit className="h-3 w-3" />
          </Button>

          {raffle.status === "pending" && (
            <>
              <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                    <Check className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Aprovação</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja aprovar este ganhavel? Ele ficará visível publicamente.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      onApprove(raffle.id);
                      setShowApprovalModal(false);
                    }}>
                      Aprovar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Ban className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Rejeitar Ganhavel</AlertDialogTitle>
                    <AlertDialogDescription>
                      Por favor, informe o motivo da rejeição:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Motivo da Rejeição</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Descreva o motivo da rejeição..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                    }}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onReject(raffle.id, rejectionReason);
                        setShowRejectModal(false);
                        setRejectionReason("");
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Rejeitar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {raffle.status === "active" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-orange-600 hover:text-orange-700"
              onClick={() => onSuspend(raffle.id)}
            >
              <Pause className="h-3 w-3" />
            </Button>
          )}

          {raffle.status === "suspended" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-600 hover:text-green-700"
              onClick={() => onReactivate(raffle.id)}
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}