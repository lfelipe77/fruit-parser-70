import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      homeNav: "Home",
      discover: "Discover",
      categories: "Categories",
      results: "Results",
      login: "Login",
      signup: "Sign Up",
      myAccount: "My Account",
      howItWorks: "How It Works",
      launchGanhavel: "Launch Ganhavel",
      
      // Hero Section
      heroTitle: "Win incredible prizes with Ganhaveis",
      heroSubtitle: "Participate in exciting raffles and transform your luck into amazing rewards",
      startNow: "Start Now",
      
      // Common actions
      participate: "Participate",
      share: "Share",
      details: "Details",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      
      // Categories
      technology: "Technology",
      vehicles: "Vehicles",
      electronics: "Electronics",
      homeCategory: "Home & Decoration",
      fashion: "Fashion",
      sports: "Sports",
      travel: "Travel",
      education: "Education",
      
      // Form fields
      name: "Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone",
      address: "Address",
      city: "City",
      state: "State",
      zipCode: "ZIP Code",
      
      // Messages
      welcomeBack: "Welcome back!",
      signupSuccess: "Account created successfully!",
      loginError: "Invalid credentials",
      requiredField: "This field is required",
      
      // Country/Region selector
      countryRegion: "Country/Region of Operation",
      selectCountryRegion: "Select where your ganhável will be offered",
      online: "Online",
      onlineDescription: "Available globally via internet",
      brazil: "Brazil",
      brazilDescription: "Brazilian market",
      usa: "United States",
      usaDescription: "American market",
      uk: "United Kingdom",
      ukDescription: "British market",
      europe: "Europe",
      europeDescription: "European market",
      global: "Global",
      country: "Country",
      region: "Region",
      reach: "Reach",
      participantsFromAnywhere: "Participants from anywhere in the world",
      participantsFrom: "Participants from {{location}}",
      importantNote: "Important: The choice of country/region determines which participants can register for your ganhável and may influence the available payment options."
    }
  },
  pt: {
    translation: {
      // Navigation
      homeNav: "Início",
      discover: "Descobrir",
      categories: "Categorias",
      results: "Resultados",
      login: "Entrar",
      signup: "Cadastrar",
      myAccount: "Minha Conta",
      howItWorks: "Como Funciona",
      launchGanhavel: "Lance seu Ganhável",
      
      // Hero Section
      heroTitle: "Ganhe premios incriveis com Ganhavel",
      heroSubtitle: "Participe de sorteios emocionantes e transforme sua sorte em recompensas incríveis",
      startNow: "Comece Agora",
      
      // Common actions
      participate: "Participar",
      share: "Compartilhar",
      details: "Detalhes",
      cancel: "Cancelar",
      confirm: "Confirmar",
      save: "Salvar",
      edit: "Editar",
      delete: "Excluir",
      
      // Categories
      technology: "Tecnologia",
      vehicles: "Veículos",
      electronics: "Eletrônicos",
      homeCategory: "Casa e Decoração",
      fashion: "Moda",
      sports: "Esportes",
      travel: "Viagem",
      education: "Educação",
      
      // Form fields
      name: "Nome",
      email: "E-mail",
      password: "Senha",
      confirmPassword: "Confirmar Senha",
      phone: "Telefone",
      address: "Endereço",
      city: "Cidade",
      state: "Estado",
      zipCode: "CEP",
      
      // Messages
      welcomeBack: "Bem-vindo de volta!",
      signupSuccess: "Conta criada com sucesso!",
      loginError: "Credenciais inválidas",
      requiredField: "Este campo é obrigatório",
      
      // Country/Region selector
      countryRegion: "País/Região de Atuação",
      selectCountryRegion: "Selecione onde seu ganhável será oferecido",
      online: "Online",
      onlineDescription: "Disponível globalmente via internet",
      brazil: "Brasil",
      brazilDescription: "Mercado brasileiro",
      usa: "Estados Unidos",
      usaDescription: "Mercado americano",
      uk: "Reino Unido",
      ukDescription: "Mercado britânico",
      europe: "Europa",
      europeDescription: "Mercado europeu",
      global: "Global",
      country: "País",
      region: "Região",
      reach: "Alcance",
      participantsFromAnywhere: "Participantes de qualquer lugar do mundo",
      participantsFrom: "Participantes de {{location}}",
      importantNote: "Importante: A escolha do país/região determina quais participantes poderão se inscrever no seu ganhável e pode influenciar nas opções de pagamento disponíveis."
    }
  },
  es: {
    translation: {
      // Navigation
      homeNav: "Inicio",
      discover: "Descubrir",
      categories: "Categorías",
      results: "Resultados",
      login: "Iniciar Sesión",
      signup: "Registrarse",
      myAccount: "Mi Cuenta",
      howItWorks: "Cómo Funciona",
      launchGanhavel: "Lanzar Ganhável",
      
      // Hero Section
      heroTitle: "Gana premios increíbles con Ganhaveis",
      heroSubtitle: "Participa en sorteos emocionantes y transforma tu suerte en recompensas increíbles",
      startNow: "Empezar Ahora",
      
      // Common actions
      participate: "Participar",
      share: "Compartir",
      details: "Detalles",
      cancel: "Cancelar",
      confirm: "Confirmar",
      save: "Guardar",
      edit: "Editar",
      delete: "Eliminar",
      
      // Categories
      technology: "Tecnología",
      vehicles: "Vehículos",
      electronics: "Electrónicos",
      homeCategory: "Hogar y Decoración",
      fashion: "Moda",
      sports: "Deportes",
      travel: "Viaje",
      education: "Educación",
      
      // Form fields
      name: "Nombre",
      email: "Email",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      phone: "Teléfono",
      address: "Dirección",
      city: "Ciudad",
      state: "Estado",
      zipCode: "Código Postal",
      
      // Messages
      welcomeBack: "¡Bienvenido de vuelta!",
      signupSuccess: "¡Cuenta creada exitosamente!",
      loginError: "Credenciales inválidas",
      requiredField: "Este campo es obligatorio",
      
      // Country/Region selector
      countryRegion: "País/Región de Operación",
      selectCountryRegion: "Selecciona donde se ofrecerá tu ganhável",
      online: "En línea",
      onlineDescription: "Disponible globalmente vía internet",
      brazil: "Brasil",
      brazilDescription: "Mercado brasileño",
      usa: "Estados Unidos",
      usaDescription: "Mercado americano",
      uk: "Reino Unido",
      ukDescription: "Mercado británico",
      europe: "Europa",
      europeDescription: "Mercado europeo",
      global: "Global",
      country: "País",
      region: "Región",
      reach: "Alcance",
      participantsFromAnywhere: "Participantes de cualquier lugar del mundo",
      participantsFrom: "Participantes de {{location}}",
      importantNote: "Importante: La elección del país/región determina qué participantes pueden registrarse en tu ganhável y puede influir en las opciones de pago disponibles."
    }
  }
};

// Custom language detector that includes IP geolocation
const customLanguageDetector = {
  name: 'customDetector',
  lookup: async (): Promise<string | undefined> => {
    try {
      // First try browser language
      const browserLang = navigator.language || navigator.languages?.[0];
      if (browserLang) {
        const lang = browserLang.split('-')[0];
        if (Object.keys(resources).includes(lang)) {
          return lang;
        }
      }
      
      // Fallback to IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // Map countries to languages
      const countryLanguageMap: Record<string, string> = {
        'BR': 'pt',
        'PT': 'pt',
        'AO': 'pt',
        'MZ': 'pt',
        'ES': 'es',
        'MX': 'es',
        'AR': 'es',
        'CO': 'es',
        'PE': 'es',
        'VE': 'es',
        'CL': 'es',
        'EC': 'es',
        'GT': 'es',
        'CU': 'es',
        'BO': 'es',
        'DO': 'es',
        'HN': 'es',
        'PY': 'es',
        'SV': 'es',
        'NI': 'es',
        'CR': 'es',
        'PA': 'es',
        'UY': 'es',
        'GQ': 'es'
      };
      
      return countryLanguageMap[data.country_code] || 'en';
    } catch (error) {
      console.warn('Language detection failed:', error);
      return 'en'; // Default fallback
    }
  },
  cacheUserLanguage: () => {
    // Optional: implement caching logic
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // Set default language to Portuguese
    fallbackLng: 'pt',
    defaultNS: 'translation',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      excludeCacheFor: ['cimode']
    },
    
    interpolation: {
      escapeValue: false
    }
  });

// Add custom detector
i18n.services.languageDetector.addDetector(customLanguageDetector);

export default i18n;