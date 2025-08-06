import React from 'react';
import SEOHead from './SEOHead';
import { getFAQSchema } from '@/utils/structuredData';

// SEO wrapper for pages that need simple meta tags
export const CategoriasSEO = () => (
  <SEOHead
    title="Categorias de Ganháveis - Carros, Casas, Eletrônicos | Ganhavel"
    description="Explore todas as categorias de ganháveis disponíveis: carros e motos, celulares, games, propriedades e gift cards. Encontre o ganhável perfeito para você!"
    canonical="https://ganhavel.com/categorias"
  />
);

export const DescobrirSEO = () => (
  <SEOHead
    title="Descobrir Ganháveis - Todos os Ganháveis Ativos | Ganhavel"
    description="Descubra todos os ganháveis ativos na Ganhavel. Filtre por categoria, preço e localização. Participe de ganháveis justos e transparentes hoje mesmo!"
    canonical="https://ganhavel.com/descobrir"
  />
);

export const ResultadosSEO = () => (
  <SEOHead
    title="Resultados de Ganháveis - Acompanhe os Sorteios | Ganhavel"
    description="Confira os resultados dos sorteios da Ganhavel. Todos os resultados são baseados na Loteria Federal para garantir transparência total."
    canonical="https://ganhavel.com/resultados"
  />
);

export const ComoFuncionaSEO = () => (
  <SEOHead
    title="Como Funciona - Guia Completo dos Ganháveis | Ganhavel"
    description="Aprenda como funcionam os ganháveis na Ganhavel. Processo transparente, baseado na Loteria Federal, com total segurança para participantes."
    canonical="https://ganhavel.com/como-funciona"
    structuredData={getFAQSchema()}
  />
);

export const LanceSeuGanhaveISEO = () => (
  <SEOHead
    title="Lance Seu Ganhavel - Crie Sua Rifa | Ganhavel"
    description="Lance sua própria rifa na Ganhavel. Plataforma segura e transparente para organizar rifas de carros, casas, eletrônicos e muito mais."
    canonical="https://ganhavel.com/lance-seu-ganhavel"
  />
);

export const CentralDeAjudaSEO = () => (
  <SEOHead
    title="Central de Ajuda - Suporte e FAQ | Ganhavel"
    description="Precisa de ajuda? Encontre respostas para suas dúvidas sobre rifas, pagamentos, sorteios e muito mais na nossa central de ajuda."
    canonical="https://ganhavel.com/central-de-ajuda"
    structuredData={getFAQSchema()}
  />
);

export const SobreNosSEO = () => (
  <SEOHead
    title="Sobre Nós - Conheça a Ganhavel | Missão e Valores"
    description="Conheça a história da Ganhavel, nossa missão de democratizar rifas justas e transparentes, e como estamos transformando este mercado no Brasil."
    canonical="https://ganhavel.com/sobre-nos"
  />
);

export const ConfiancaSegurancaSEO = () => (
  <SEOHead
    title="Confiança e Segurança - Rifas Seguras | Ganhavel"
    description="Entenda como garantimos a segurança e transparência das rifas. Todos os sorteios seguem a Loteria Federal para máxima confiabilidade."
    canonical="https://ganhavel.com/confianca-seguranca"
  />
);

export const GuiaDoCriadorSEO = () => (
  <SEOHead
    title="Guia do Criador - Como Organizar Rifas | Ganhavel"
    description="Guia completo para organizar rifas na Ganhavel. Aprenda as melhores práticas, regras e dicas para criar rifas de sucesso."
    canonical="https://ganhavel.com/guia-do-criador"
  />
);