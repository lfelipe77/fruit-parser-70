import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, X } from "lucide-react";
import { getStatesWithRifas, getCitiesWithRifas } from "@/data/locations";
import { LocationFilter as LocationFilterType } from "@/hooks/useLocationFilter";

interface LocationFilterProps {
  rifas: any[];
  filter: LocationFilterType;
  onFilterChange: (filter: Partial<LocationFilterType>) => void;
  onClearFilters: () => void;
}

export default function LocationFilter({ 
  rifas, 
  filter, 
  onFilterChange, 
  onClearFilters 
}: LocationFilterProps) {
  const availableStates = getStatesWithRifas(rifas);
  const availableCities = filter.state ? getCitiesWithRifas(rifas, filter.state) : [];
  
  const hasActiveFilters = filter.state || filter.city || filter.showOnlineOnly;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Filtrar por Localização</h3>
      </div>

      {/* Botão Online */}
      <div className="space-y-3">
        <Button
          variant={filter.showOnlineOnly ? "default" : "outline"}
          onClick={() => onFilterChange({ showOnlineOnly: !filter.showOnlineOnly })}
          className="w-full justify-start"
        >
          <Globe className="h-4 w-4 mr-2" />
          Apenas Rifas Online
        </Button>

        {/* Seletor de Estado */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Estado</label>
          <Select
            value={filter.state || "all-states"}
            onValueChange={(value) => onFilterChange({ state: value === "all-states" ? null : value })}
            disabled={filter.showOnlineOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-states">Todos os estados</SelectItem>
              {availableStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seletor de Cidade */}
        {filter.state && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Cidade</label>
            <Select
              value={filter.city || "all-cities"}
              onValueChange={(value) => onFilterChange({ city: value === "all-cities" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-cities">Todas as cidades</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Filtros ativos:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filter.showOnlineOnly && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
            {filter.state && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {filter.state}
              </Badge>
            )}
            {filter.city && (
              <Badge variant="secondary" className="text-xs">
                {filter.city}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}