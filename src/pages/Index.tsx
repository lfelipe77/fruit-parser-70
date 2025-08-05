import SEOHead from "@/components/SEOHead";
import { getOrganizationSchema, getWebsiteSchema } from "@/utils/structuredData";
import CrowdfundingHome from "./CrowdfundingHome";

const Index = () => {
  const structuredData = [
    getOrganizationSchema(),
    getWebsiteSchema()
  ];

  return (
    <>
      <SEOHead 
        title="Ganhavel - Rifas Justas e Transparentes | Realize Seus Sonhos"
        description="Participe de rifas seguras e transparentes. Carros, casas, eletrônicos e muito mais! Todos os sorteios seguem a loteria federal para garantir justiça."
        canonical="https://ganhavel.com"
        structuredData={structuredData}
      />
      <CrowdfundingHome />
    </>
  );
};

export default Index;
