import { useState, useMemo } from 'react';

export interface LocationFilter {
  state: string | null;
  city: string | null;
  showOnlineOnly: boolean;
}

export const useLocationFilter = (rifas: any[]) => {
  const [filter, setFilter] = useState<LocationFilter>({
    state: null,
    city: null,
    showOnlineOnly: false
  });

  const filteredRifas = useMemo(() => {
    return rifas.filter(rifa => {
      // Se está mostrando apenas online
      if (filter.showOnlineOnly) {
        return rifa.location === "Online";
      }

      // Se nenhum filtro está aplicado
      if (!filter.state && !filter.city) {
        return true;
      }

      // Se rifa é online e não está no modo "apenas online"
      if (rifa.location === "Online") {
        return false;
      }

      const [city, state] = rifa.location?.split(", ") || [];

      // Filtro por estado
      if (filter.state && state !== filter.state) {
        return false;
      }

      // Filtro por cidade
      if (filter.city && city !== filter.city) {
        return false;
      }

      return true;
    });
  }, [rifas, filter]);

  const updateFilter = (newFilter: Partial<LocationFilter>) => {
    setFilter(prev => {
      const updated = { ...prev, ...newFilter };
      
      // Se mudou o estado, limpa a cidade
      if (newFilter.state !== undefined && newFilter.state !== prev.state) {
        updated.city = null;
      }
      
      // Se ativou "online only", limpa estado e cidade
      if (newFilter.showOnlineOnly) {
        updated.state = null;
        updated.city = null;
      }
      
      return updated;
    });
  };

  const clearFilters = () => {
    setFilter({
      state: null,
      city: null,
      showOnlineOnly: false
    });
  };

  return {
    filter,
    filteredRifas,
    updateFilter,
    clearFilters
  };
};