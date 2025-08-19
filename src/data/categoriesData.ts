import { 
  Monitor, 
  Smartphone, 
  Gamepad2,
  ChefHat,
  Gift, 
  Car,
  TrendingUp,
  Sparkles
} from "lucide-react";

export interface CategoryData {
  name: string;
  icon: any;
  color: string;
  count: number;
  slug: string;
  subcategories: {
    name: string;
    items: string[];
    count: number;
    slug: string;
  }[];
}

export const categoriesData: Record<string, CategoryData> = {
  eletronicos: {
    name: "Eletrônicos",
    icon: Monitor,
    color: "text-blue-500",
    count: 156,
    slug: "eletronicos",
    subcategories: [
      { name: "Celulares", items: ["iPhone 15 Pro Max", "Samsung Galaxy S24", "Xiaomi 14"], count: 45, slug: "celulares" },
      { name: "Tablets", items: ["iPad Pro", "Samsung Tab S9", "Surface Pro"], count: 28, slug: "tablets" },
      { name: "TVs", items: ["Smart TV Samsung 65\"", "LG OLED 55\"", "Sony Bravia 75\""], count: 32, slug: "tvs" },
      { name: "Notebooks", items: ["MacBook Pro M3", "Dell XPS 13", "Lenovo ThinkPad"], count: 51, slug: "notebooks" }
    ]
  },
  "celulares-smartwatches": {
    name: "Celulares & Smartwatches", 
    icon: Smartphone,
    color: "text-purple-500",
    count: 89,
    slug: "celulares-smartwatches",
    subcategories: [
      { name: "iPhone", items: ["iPhone 15 Pro Max", "iPhone 15", "iPhone 14 Pro"], count: 34, slug: "iphone" },
      { name: "Samsung Galaxy", items: ["Galaxy S24 Ultra", "Galaxy Z Flip 5", "Galaxy A54"], count: 25, slug: "samsung-galaxy" },
      { name: "Apple Watch", items: ["Apple Watch Series 9", "Apple Watch Ultra 2", "Apple Watch SE"], count: 18, slug: "apple-watch" },
      { name: "Smartwatches Android", items: ["Galaxy Watch 6", "Garmin Fenix 7", "Amazfit GTR 4"], count: 12, slug: "smartwatches-android" }
    ]
  },
  "games-consoles": {
    name: "Games & Consoles",
    icon: Gamepad2,
    color: "text-pink-500", 
    count: 78,
    slug: "games-consoles",
    subcategories: [
      { name: "PlayStation", items: ["PlayStation 5", "PlayStation 5 Digital", "PS5 + Jogos"], count: 28, slug: "playstation" },
      { name: "Xbox", items: ["Xbox Series X", "Xbox Series S", "Xbox Game Pass"], count: 22, slug: "xbox" },
      { name: "Nintendo", items: ["Nintendo Switch OLED", "Nintendo Switch Lite", "Steam Deck"], count: 16, slug: "nintendo" },
      { name: "Jogos", items: ["FIFA 24", "Call of Duty", "Spider-Man 2"], count: 12, slug: "jogos" }
    ]
  },
  eletrodomesticos: {
    name: "Eletrodomésticos",
    icon: ChefHat,
    color: "text-yellow-500",
    count: 45,
    slug: "eletrodomesticos",
    subcategories: [
      { name: "Cozinha", items: ["Air Fryer Philips", "Microondas Panasonic", "Liquidificador Vitamix"], count: 18, slug: "cozinha" },
      { name: "Limpeza", items: ["Aspirador Robô Roomba", "Lavadora Samsung", "Secadora LG"], count: 15, slug: "limpeza" },
      { name: "Climatização", items: ["Ar Condicionado Split", "Ventilador Dyson", "Aquecedor Britânia"], count: 8, slug: "climatizacao" },
      { name: "Pequenos", items: ["Cafeteira Nespresso", "Batedeira KitchenAid", "Torradeira Oster"], count: 4, slug: "pequenos" }
    ]
  },
  "dinheiro-giftcards": {
    name: "Gift Cards",
    icon: Gift,
    color: "text-green-500",
    count: 67,
    slug: "dinheiro-giftcards",
    subcategories: [
      { name: "Gift Cards", items: ["Amazon R$ 1.000", "Magazine Luiza R$ 2.000", "Americanas R$ 500"], count: 22, slug: "gift-cards" },
      { name: "Cartões Pré-pagos", items: ["Visa R$ 1.500", "Mastercard R$ 2.000", "Elo R$ 800"], count: 12, slug: "cartoes-pre-pagos" },
      { name: "Investimentos", items: ["Bitcoin 0.1 BTC", "Ações Petrobras", "CDB R$ 5.000"], count: 8, slug: "investimentos" },
      { name: "Outros", items: ["Cashback Apps", "Criptomoedas", "NFTs"], count: 5, slug: "outros" }
    ]
  },
  "carros-motos": {
    name: "Carros & Motos",
    icon: Car,
    color: "text-red-500",
    count: 134,
    slug: "carros-motos",
    subcategories: [
      { name: "Carros Populares", items: ["Honda Civic 2024", "Toyota Corolla", "Volkswagen Jetta"], count: 45, slug: "carros-populares" },
      { name: "Carros Premium", items: ["BMW X3", "Mercedes C180", "Audi A4"], count: 38, slug: "carros-premium" },
      { name: "Motos", items: ["Yamaha MT-03", "Honda CB 600F", "Suzuki GSX-R750"], count: 32, slug: "motos" },
      { name: "Elétricos", items: ["Tesla Model 3", "BYD Dolphin", "GWM Ora 03"], count: 19, slug: "eletricos" }
    ]
  },
  "produtos-virais": {
    name: "Produtos Virais",
    icon: TrendingUp,
    color: "text-orange-500",
    count: 92,
    slug: "produtos-virais",
    subcategories: [
      { name: "Tech Viral", items: ["AirPods Pro", "Ring Light LED", "Carregador Sem Fio"], count: 28, slug: "tech-viral" },
      { name: "Casa & Decoração", items: ["Luminária Estética", "Plantas Artificiais", "Espelho LED"], count: 24, slug: "casa-decoracao" },
      { name: "Fitness", items: ["Smartwatch Fitness", "Tapete de Yoga", "Halteres Ajustáveis"], count: 22, slug: "fitness" },
      { name: "Beleza", items: ["Escova Alisadora", "Kit Skincare", "Perfumes Importados"], count: 18, slug: "beleza" }
    ]
  },
  diversos: {
    name: "Diversos (com Propriedades)",
    icon: Sparkles,
    color: "text-emerald-500",
    count: 34,
    slug: "diversos",
    subcategories: [
      { name: "Imóveis", items: ["Casa em Alphaville", "Apartamento Zona Sul SP", "Terreno Praia"], count: 12, slug: "imoveis" },
      { name: "Experiências", items: ["Viagem Disney", "Cruzeiro Caribe", "Safari África"], count: 10, slug: "experiencias" },
      { name: "Cursos", items: ["MBA Executivo", "Curso Piloto", "Inglês Fluente"], count: 8, slug: "cursos" },
      { name: "Serviços", items: ["Personal Trainer 1 ano", "Dentista Completo", "Spa Day"], count: 4, slug: "servicos" }
    ]
  }
};

// Simple categories for display
export const categoriesSimple = [
  { name: "Eletrônicos", icon: Monitor, count: 156, color: "text-blue-500", slug: "eletronicos" },
  { name: "Celulares & Smartwatches", icon: Smartphone, count: 89, color: "text-purple-500", slug: "celulares-smartwatches" },
  { name: "Games & Consoles", icon: Gamepad2, count: 78, color: "text-pink-500", slug: "games-consoles" },
  { name: "Eletrodomésticos", icon: ChefHat, count: 45, color: "text-yellow-500", slug: "eletrodomesticos" },
  { name: "Gift Cards", icon: Gift, count: 67, color: "text-green-500", slug: "dinheiro-giftcards" },
  { name: "Carros & Motos", icon: Car, count: 134, color: "text-red-500", slug: "carros-motos" },
  { name: "Produtos Virais", icon: TrendingUp, count: 92, color: "text-orange-500", slug: "produtos-virais" },
  { name: "Diversos (com Propriedades)", icon: Sparkles, count: 34, color: "text-emerald-500", slug: "diversos" },
];

export const getAllCategories = () => categoriesSimple;
export const getCategoryBySlug = (slug: string) => categoriesData[slug];
export const getAllCategoriesData = () => categoriesData;