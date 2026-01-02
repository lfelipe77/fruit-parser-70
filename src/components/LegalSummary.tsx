import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, CreditCard, Scale, ExternalLink } from 'lucide-react';

interface LegalSummaryProps {
  variant?: 'compact' | 'full' | 'modal' | 'footer';
  showLinks?: boolean;
  className?: string;
}

/**
 * Resumo Legal para UX - Ganhavel
 * Componente reutilizável para onboarding, checkout, modais e footer.
 * Linguagem acessível e amigável.
 */
const LegalSummary: React.FC<LegalSummaryProps> = ({ 
  variant = 'compact',
  showLinks = true,
  className = ''
}) => {
  const legalPoints = [
    {
      icon: Shield,
      title: 'Plataforma Intermediária',
      description: 'A Ganhavel é uma plataforma tecnológica que conecta organizadores e participantes. Não organizamos sorteios.',
    },
    {
      icon: Users,
      title: 'Responsabilidade do Organizador',
      description: 'Os organizadores são responsáveis pelos prêmios, legalidade e entrega. Verifique a reputação antes de participar.',
    },
    {
      icon: CreditCard,
      title: 'Pagamentos Seguros',
      description: 'Pagamentos processados por provedores terceirizados certificados. Não armazenamos dados de cartão.',
    },
    {
      icon: Scale,
      title: 'Maiores de 18 Anos',
      description: 'A participação é exclusiva para maiores de 18 anos com capacidade civil plena.',
    },
  ];

  // Versão compacta para footer ou checkboxes
  if (variant === 'compact') {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        <p>
          Ao continuar, você confirma ter <strong>18+ anos</strong> e concorda com nossos{' '}
          <Link to="/termos-e-condicoes" className="text-primary hover:underline">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link to="/politica-de-privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </Link>.
        </p>
        <p className="mt-1 text-xs">
          A Ganhavel é intermediária. Organizadores são responsáveis pelos prêmios.
        </p>
      </div>
    );
  }

  // Versão para modal de checkout
  if (variant === 'modal') {
    return (
      <div className={`bg-accent/30 rounded-lg p-4 ${className}`}>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Informações Importantes
        </h4>
        <ul className="text-xs space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>A Ganhavel é uma plataforma intermediária e <strong>não organiza</strong> este sorteio.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>O <strong>organizador é responsável</strong> pela entrega do prêmio.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Você confirma ter <strong>18 anos ou mais</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Pagamento processado por provedor terceirizado seguro.</span>
          </li>
        </ul>
        {showLinks && (
          <div className="mt-3 pt-3 border-t border-border flex gap-4 text-xs">
            <Link to="/termos-e-condicoes" className="text-primary hover:underline flex items-center gap-1">
              Termos de Uso <ExternalLink className="h-3 w-3" />
            </Link>
            <Link to="/politica-de-privacidade" className="text-primary hover:underline flex items-center gap-1">
              Privacidade <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Versão para footer
  if (variant === 'footer') {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-foreground mb-2">Sobre a Plataforma</p>
            <ul className="space-y-1 text-xs">
              <li>• Plataforma intermediária entre organizadores e participantes</li>
              <li>• Não organizamos sorteios nem garantimos prêmios</li>
              <li>• Organizadores são responsáveis pela entrega</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">Segurança</p>
            <ul className="space-y-1 text-xs">
              <li>• Pagamentos via provedores certificados</li>
              <li>• Dados protegidos conforme LGPD</li>
              <li>• Uso exclusivo para maiores de 18 anos</li>
            </ul>
          </div>
        </div>
        {showLinks && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <Link to="/termos-e-condicoes" className="text-primary hover:underline">
              Termos e Condições
            </Link>
            <Link to="/politica-de-privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Versão completa para onboarding
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Como a Ganhavel Funciona
        </h3>
        <p className="text-muted-foreground text-sm">
          Resumo rápido para você participar com segurança
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {legalPoints.map((point, index) => {
          const Icon = point.icon;
          return (
            <div 
              key={index} 
              className="bg-accent/30 rounded-lg p-4 flex gap-3"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm mb-1">
                  {point.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showLinks && (
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Ao continuar, você confirma ter 18+ anos e concorda com:
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link to="/termos-e-condicoes" className="text-primary hover:underline font-medium">
              Termos de Uso
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/politica-de-privacidade" className="text-primary hover:underline font-medium">
              Política de Privacidade
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalSummary;
