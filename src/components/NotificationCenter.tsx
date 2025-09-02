import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Trophy, Heart, DollarSign, Calendar, X, Ticket, Crown } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications, markNotificationRead, markAllNotificationsRead } from '@/hooks/useNotifications';
import { FLAGS } from '@/config/flags';
import { useAuthContext } from '@/providers/AuthProvider';

export default function NotificationCenter() {
  const { user } = useAuthContext();
  const enabled = FLAGS.notifications && !!user?.id;

  const {
    data: notifications = [],
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeletingNotification
  } = useNotifications(enabled ? user!.id : undefined);

  const getIcon = (type: string) => {
    switch (type) {
      case 'nova_rifa':
        return <Trophy className="h-4 w-4 text-primary" />;
      case 'rifa_finalizada':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'sorteio_proximo':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'organizador_seguido':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'ticket_purchased':
        return <Ticket className="h-4 w-4 text-blue-500" />;
      case 'winner_selected':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'há pouco tempo';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {enabled && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              {enabled && unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => user && markAllNotificationsRead(user.id)}
                  disabled={isMarkingAllAsRead}
                  className="text-xs"
                >
                  {isMarkingAllAsRead ? 'Marcando...' : 'Marcar todas como lidas'}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {!enabled ? (
              <div className="p-4 text-center text-muted-foreground">
                Notificações desativadas (flag off)
              </div>
            ) : isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        !notification.read_at ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              disabled={isDeletingNotification}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          
                          <div className="text-xs text-muted-foreground mt-2">
                            {notification.type.replace('_', ' ')} • {formatTimeAgo(notification.created_at)}
                          </div>
                        </div>
                        
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}