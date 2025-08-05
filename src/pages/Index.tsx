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
        title="Ganhavel – Ganháveis Justos e Transparentes"
        description="Ganhe prêmios reais ou crie seu próprio ganhável com links de afiliado. Tudo rastreável, seguro e baseado nos sorteios da Loteria Federal."
        canonical="https://ganhavel.com"
        structuredData={structuredData}
      />
      <CrowdfundingHome />
    </>
  );
};

export default Index;
