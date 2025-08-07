import { useEffect } from "react";

export default function CrowdfundingHome() {
  useEffect(() => {
    console.log("🎉 Site carregado com sucesso - Fallback Test");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Hello World - Fallback Test</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Se você está vendo isso, a estrutura básica está funcionando!
        </p>
        <div className="text-sm text-green-600">
          ✅ React funcionando<br/>
          ✅ Tailwind funcionando<br/>
          ✅ Roteamento funcionando<br/>
          ✅ Sem dependências externas
        </div>
      </div>
    </div>
  );
}