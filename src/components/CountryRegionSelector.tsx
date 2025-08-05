import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface CountryRegionOption {
  id: string;
  name: string;
  flag: string;
  description: string;
  type: 'online' | 'country' | 'region';
}

const getCountryRegionOptions = (t: any): CountryRegionOption[] => [
  {
    id: 'online',
    name: t('online'),
    flag: '🌐',
    description: t('onlineDescription'),
    type: 'online'
  },
  {
    id: 'brasil',
    name: t('brazil'),
    flag: '🇧🇷',
    description: t('brazilDescription'),
    type: 'country'
  },
  {
    id: 'usa',
    name: t('usa'),
    flag: '🇺🇸',
    description: t('usaDescription'),
    type: 'country'
  },
  {
    id: 'uk',
    name: t('uk'),
    flag: '🇬🇧',
    description: t('ukDescription'),
    type: 'country'
  },
  {
    id: 'europe',
    name: t('europe'),
    flag: '🇪🇺',
    description: t('europeDescription'),
    type: 'region'
  }
];

interface CountryRegionSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export default function CountryRegionSelector({ value, onValueChange, disabled = false }: CountryRegionSelectorProps) {
  const { t } = useTranslation();
  const countryRegionOptions = getCountryRegionOptions(t);
  const selectedOption = countryRegionOptions.find(option => option.id === value);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('countryRegion')}
        </label>
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectCountryRegion')} />
          </SelectTrigger>
          <SelectContent>
            {countryRegionOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.flag}</span>
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOption && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-2xl">{selectedOption.flag}</span>
              {selectedOption.name}
              <Badge variant="secondary" className="capitalize">
                {selectedOption.type === 'online' ? t('global') : 
                 selectedOption.type === 'country' ? t('country') : t('region')}
              </Badge>
            </CardTitle>
            <CardDescription>
              {selectedOption.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {selectedOption.type === 'online' ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <MapPin className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">{t('reach')}:</span>
              <span className="text-primary font-medium">
                {selectedOption.type === 'online' 
                  ? t('participantsFromAnywhere')
                  : t('participantsFrom', { location: selectedOption.name })
                }
              </span>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                {t('importantNote')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}