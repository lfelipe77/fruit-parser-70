export interface LocationData {
  state: string;
  cities: string[];
}

export const brazilStates: LocationData[] = [
  {
    state: "São Paulo",
    cities: ["São Paulo", "Campinas", "Santos", "Sorocaba", "Ribeirão Preto"]
  },
  {
    state: "Rio de Janeiro", 
    cities: ["Rio de Janeiro", "Niterói", "Petrópolis", "Nova Iguaçu", "Duque de Caxias"]
  },
  {
    state: "Minas Gerais",
    cities: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"]
  },
  {
    state: "Rio Grande do Sul",
    cities: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"]
  },
  {
    state: "Paraná",
    cities: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"]
  },
  {
    state: "Bahia",
    cities: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"]
  },
  {
    state: "Santa Catarina",
    cities: ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma"]
  },
  {
    state: "Goiás",
    cities: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"]
  },
  {
    state: "Pernambuco",
    cities: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"]
  },
  {
    state: "Ceará",
    cities: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"]
  }
];

export const getStatesWithRifas = (rifas: any[]) => {
  const statesWithRifas = new Set<string>();
  
  rifas.forEach(rifa => {
    if (rifa.location && rifa.location !== "Online") {
      const state = rifa.location.split(", ")[1];
      if (state) {
        statesWithRifas?.add?.(state);
      }
    }
  });
  
  return Array.from(statesWithRifas);
};

export const getCitiesWithRifas = (rifas: any[], selectedState: string) => {
  const citiesWithRifas = new Set<string>();
  
  rifas.forEach(rifa => {
    if (rifa.location && rifa.location !== "Online") {
      const [city, state] = rifa.location.split(", ");
      if (state === selectedState && city) {
        citiesWithRifas?.add?.(city);
      }
    }
  });
  
  return Array.from(citiesWithRifas);
};