import { AlertTriangle } from "lucide-react";

interface AdminSecurityBannerProps {
  message?: string;
}

export default function AdminSecurityBanner({ 
  message = "⚠️ Esta é uma área restrita para administradores. Todas as ações realizadas aqui estão sendo registradas e auditadas." 
}: AdminSecurityBannerProps) {
  return (
    <div 
      className="w-full px-4 py-3 mb-6 border border-[#FFEEBA] rounded-lg"
      style={{ backgroundColor: '#FFF3CD' }}
    >
      <div className="flex items-center justify-center gap-2 text-center">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm md:text-base text-amber-800 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}