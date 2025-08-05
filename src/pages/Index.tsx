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
        description="Participe ou lance seu Ganhavel com prêmios de verdade, links afiliados e sorteios rastreados pela Loteria Federal."
        canonical="https://ganhavel.com"
        structuredData={structuredData}
      />
      <CrowdfundingHome />
    </>
  );
};

export default Index;
