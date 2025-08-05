import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Trophy, Heart, DollarSign, Calendar, X } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: 'nova_rifa' | 'rifa_finalizada' | 'sorteio_proximo' | 'organizador_seguido';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  organizador?: string;
  ganhavelTitle?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'nova_rifa',
    title: 'Novo Ganhavel Lançado!',
    message: 'João Silva lançou um novo ganhavel: iPhone 15 Pro Max',
    timestamp: '2 horas atrás',
    read: false,
    organizador: 'João Silva',
    ganhavelTitle: 'iPhone 15 Pro Max'
  },
  {
    id: '2',
    type: 'sorteio_proximo',
    title: 'Sorteio em Breve',
    message: 'O ganhavel "R$ 50.000" será sorteado em 24 horas',
    timestamp: '1 dia atrás',
    read: false,
    ganhavelTitle: 'R$ 50.000'
  },
  {
    id: '3',
    type: 'rifa_finalizada',
    title: 'Ganhavel Finalizado',
    message: 'O ganhavel "PlayStation 5" foi concluído com sucesso!',
    timestamp: '2 dias atrás',
    read: true,
    ganhavelTitle: 'PlayStation 5'
  },
  {
    id: '4',
    type: 'organizador_seguido',
    title: 'Novo Seguidor',
    message: 'Maria Santos começou a seguir você',
    timestamp: '3 dias atrás',
    read: true,
    organizador: 'Maria Santos'
  }
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
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
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}