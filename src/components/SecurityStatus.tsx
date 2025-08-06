import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityStatusProps {
  className?: string;
}

export const SecurityStatus = ({ className }: SecurityStatusProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const securityFeatures = [
    {
      name: 'Rate Limiting',
      status: 'active',
      description: 'Limita tentativas de criação de rifas (5/hora), login (5/15min), cadastro (3/hora)',
      icon: Clock,
    },
    {
      name: 'Proteção Anti-Bot',
      status: 'active', 
      description: 'Cloudflare Turnstile protege formulários críticos contra bots',
      icon: Shield,
    },
    {
      name: 'Validação de Formulários',
      status: 'active',
      description: 'Validação rigorosa com Zod em tempo real',
      icon: CheckCircle,
    },
    {
      name: 'Monitoramento de Segurança',
      status: 'active',
      description: 'Logs de auditoria e detecção de atividades suspeitas',
      icon: Lock,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">Status de Segurança</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            🔐 Protegido
          </Badge>
        </div>
        <CardDescription>
          Sistema de proteção contra abusos e bots ativo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo rápido */}
        <Alert className="border-green-200 bg-green-50/50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm">
            <strong>Todas as proteções estão ativas:</strong> Rate limiting, validação anti-bot e monitoramento em tempo real.
          </AlertDescription>
        </Alert>

        {/* Lista de features de segurança */}
        <div className="space-y-3">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Icon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{feature.name}</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      Ativo
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações adicionais */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3" />
            <span>Caso você encontre algum limite, aguarde o tempo indicado ou entre em contato conosco.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};