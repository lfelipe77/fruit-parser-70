import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeroStatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  hasValue?: boolean;
}

const HeroStatsCard = React.memo(({ 
  icon: Icon, 
  value, 
  label, 
  hasValue = true 
}: HeroStatsCardProps) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">
        <div className="w-8 md:w-10 h-8 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 md:w-5 h-4 md:h-5 text-primary" />
        </div>
      </div>
      <div className={`font-semibold text-base md:text-lg ${!hasValue ? 'text-muted-foreground' : ''}`}>
        {value}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
    </div>
  );
});

HeroStatsCard.displayName = 'HeroStatsCard';

export default HeroStatsCard;