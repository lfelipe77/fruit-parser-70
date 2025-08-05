
import hondaCivic from "@/assets/honda-civic-2024.jpg";
import hondaCivicRealistic from "@/assets/honda-civic-2024-realistic.jpg";
import iphone15ProMax from "@/assets/iphone-15-pro-max.jpg";
import casaAlphaville from "@/assets/casa-alphaville.jpg";
import yamahaMT03 from "@/assets/yamaha-mt03-2024.jpg";
import dinheiro50k from "@/assets/dinheiro-50k.jpg";
import ps5Setup from "@/assets/ps5-setup-gamer.jpg";

export interface GanhaveisData {
  id: string;
  title: string;
  description: string;
  image: string;
  totalTickets: number;
  soldTickets: number;
  daysLeft: number;
  category: string;
  ticketPrice: number;
  goal: number;
  raised: number;
  directPurchaseLink?: string;
  directPurchaseSite?: string;
  lotteryType: string;
  organizer: string;
  organizerUsername: string;
  organizerRating: number;
  organizerGanhaveis: number;
  location: string;
  backers: number;
}

export const ganhaveisData: Record<string, GanhaveisData> = {
  "honda-civic-0km-2024": {
    id: "honda-civic-0km-2024",
    title: "Honda Civic 0KM 2024",
    description: "Honda Civic LX CVT 2024 zero quilômetro, cor preta, com garantia de fábrica. Veículo será entregue na concessionária autorizada com toda documentação em ordem.",
    image: hondaCivicRealistic,
    totalTickets: 1000,
    soldTickets: 787,
    daysLeft: 18,
    category: "Carros & Motos",
    ticketPrice: 5,
    goal: 5000,
    raised: 3935,
    directPurchaseLink: "https://concessionaria-saopaulo.com.br/honda-civic-2024",
    directPurchaseSite: "Link do Vendedor",
    lotteryType: "Loteria Federal",
    organizer: "João Silva",
    organizerUsername: "joaosilva",
    organizerRating: 4.9,
    organizerGanhaveis: 23,
    location: "São Paulo, SP",
    backers: 847,
  },
  "iphone-15-pro-max-256gb": {
    id: "iphone-15-pro-max-256gb",
    title: "iPhone 15 Pro Max 256GB",
    description: "iPhone 15 Pro Max novo, lacrado, cor titânio natural com 256GB de armazenamento. Produto original Apple com garantia de 1 ano.",
    image: iphone15ProMax,
    totalTickets: 500,
    soldTickets: 312,
    daysLeft: 9,
    category: "Celulares & Smartwatches",
    ticketPrice: 5,
    goal: 2500,
    raised: 1560,
    directPurchaseLink: "https://apple.com/br/iphone-15-pro",
    directPurchaseSite: "Apple Store",
    lotteryType: "Loteria Federal",
    organizer: "Maria Santos",
    organizerUsername: "mariasantos",
    organizerRating: 4.8,
    organizerGanhaveis: 15,
    location: "Online",
    backers: 312,
  },
  "casa-em-condominio-alphaville": {
    id: "casa-em-condominio-alphaville",
    title: "Casa em Condomínio - Alphaville",
    description: "Casa nova de 3 quartos em condomínio fechado com área de lazer completa. 150m² construídos, 2 vagas de garagem e jardim privativo.",
    image: casaAlphaville,
    totalTickets: 5000,
    soldTickets: 3625,
    daysLeft: 22,
    category: "Diversos (com Propriedades)",
    ticketPrice: 1,
    goal: 5000,
    raised: 3625,
    directPurchaseLink: "https://imobiliaria-alphaville.com.br",
    directPurchaseSite: "Imobiliária Alphaville",
    lotteryType: "Mega-Sena",
    organizer: "Carlos Oliveira",
    organizerUsername: "carlosoliveira",
    organizerRating: 4.9,
    organizerGanhaveis: 8,
    location: "Alphaville, SP",
    backers: 1450,
  },
  "yamaha-mt-03-0km-2024": {
    id: "yamaha-mt-03-0km-2024",
    title: "Yamaha MT-03 0KM 2024",
    description: "Moto Yamaha MT-03 zero quilômetro, cor azul, com garantia de fábrica e documentação inclusa. Entrega em concessionária autorizada.",
    image: yamahaMT03,
    totalTickets: 800,
    soldTickets: 672,
    daysLeft: 14,
    category: "Carros & Motos",
    ticketPrice: 5,
    goal: 4000,
    raised: 3360,
    directPurchaseLink: "https://yamaha-motor.com.br/mt-03",
    directPurchaseSite: "Yamaha Oficial",
    lotteryType: "Loteria Federal",
    organizer: "Pedro Costa",
    organizerUsername: "pedrocosta",
    organizerRating: 4.7,
    organizerGanhaveis: 12,
    location: "Rio de Janeiro, RJ",
    backers: 672,
  },
  "r-50-000-em-dinheiro": {
    id: "r-50-000-em-dinheiro",
    title: "Facebook Ads Gift Card",
    description: "Gift Card no valor de R$ 50.000 para impulsionar suas campanhas publicitárias no Facebook e Instagram. Perfeito para empresários e profissionais de marketing digital.",
    image: dinheiro50k,
    totalTickets: 1000,
    soldTickets: 835,
    daysLeft: 5,
    category: "Gift Cards",
    ticketPrice: 5,
    goal: 5000,
    raised: 4175,
    lotteryType: "Mega-Sena",
    organizer: "Ana Silva",
    organizerUsername: "anasilva",
    organizerRating: 5.0,
    organizerGanhaveis: 31,
    location: "Online",
    backers: 835,
  },
  "playstation-5-setup-gamer": {
    id: "playstation-5-setup-gamer",
    title: "PlayStation 5 + Setup Gamer",
    description: "PS5 + TV 55' 4K + Headset + Controle extra + 5 jogos exclusivos. Setup gamer completo para sua diversão.",
    image: ps5Setup,
    totalTickets: 600,
    soldTickets: 456,
    daysLeft: 28,
    category: "Games & Consoles",
    ticketPrice: 5,
    goal: 3000,
    raised: 2280,
    directPurchaseLink: "https://playstation.com/pt-br",
    directPurchaseSite: "PlayStation Store",
    lotteryType: "Quina",
    organizer: "Lucas Ferreira",
    organizerUsername: "lucasferreira",
    organizerRating: 4.6,
    organizerGanhaveis: 19,
    location: "Online",
    backers: 456,
  },
};

// Helper function to get ganhavel by ID
export const getGanhaveisById = (id: string): GanhaveisData | undefined => {
  return ganhaveisData[id];
};

// Helper function to get all ganhaveis as array
export const getAllGanhaveis = (): GanhaveisData[] => {
  return Object.values(ganhaveisData);
};
