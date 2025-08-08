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
        title="Ganhavel – Ganhe prêmios reais com transparência e sorte oficial"
        description="Ganhavel: participe ou lance rifas com prêmios reais, transparência total e sorteios auditáveis pela Loteria Federal. Crie, compartilhe e ganhe."
        canonical="https://ganhavel.com"
        structuredData={structuredData}
      />
      <CrowdfundingHome />
    </>
  );
};

export default Index;
