import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { I18nextProvider } from 'react-i18next';
import i18n from "@/i18n";
import Index from "./pages/Index";
import Categorias from "./pages/Categorias";
import GanhaveisDetail from "./pages/GanhaveisDetail";
import SubcategoriaGanhaveis from "./pages/SubcategoriaGanhaveis";
import ComoFunciona from "./pages/ComoFunciona";
import Resultados from "./pages/Resultados";
import SobreNos from "./pages/SobreNos";
import Descobrir from "./pages/Descobrir";
import ConfiancaSeguranca from "./pages/ConfiancaSeguranca";
import TrabalheConosco from "./pages/TrabalheConosco";
import CentralDeAjuda from "./pages/CentralDeAjuda";
import GuiaDoCriador from "./pages/GuiaDoCriador";
import BusinessModel from "./pages/BusinessModel";
import Investment from "./pages/Investment";
import CrowdfundingHome from "./pages/CrowdfundingHome";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetPassword from "./pages/ResetPassword";
import AlterarSenha from "./pages/AlterarSenha";
import AuthCallback from "./pages/AuthCallback";
import MinhaConta from "./pages/MinhaConta";
import LanceSeuGanhavel from "./pages/LanceSeuGanhavel";
import GerenciarGanhavel from "./pages/GerenciarGanhavel";
import GerenciarCartoesEPix from "./pages/GerenciarCartoesEPix";
import ConfirmacaoPagamento from "./pages/ConfirmacaoPagamento";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoErro from "./pages/PagamentoErro";
import PaymentSuccess from "./pages/PaymentSuccess";
import PerfilPublico from "./pages/PerfilPublico";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import DebugToken from "./pages/DebugToken";
import TestPayment from "./pages/TestPayment";
import TestAudit from "./pages/TestAudit";

import ScrollToTop from "./components/ScrollToTop";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import UsersManagement from "./pages/admin/UsersManagement";
import GanhaveisManagement from "./pages/admin/GanhaveisManagement";
import GanhavelsConcluidos from "./pages/admin/GanhavelsConcluidos";
import FinancialControl from "./pages/admin/FinancialControl";
import SupportTickets from "./pages/admin/SupportTickets";
import Settings from "./pages/admin/Settings";
import AuditLogs from "./pages/admin/AuditLogs";
import FraudDetection from "./pages/admin/FraudDetection";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminRateLimits from "./pages/admin/AdminRateLimits";
import AdminVisits from "./pages/admin/AdminVisits";
import TurnstileTest from "./pages/TurnstileTest";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { usePublicVisitLogger, shouldLogPage } from "@/hooks/usePublicVisitLogger";

const queryClient = new QueryClient();

// Debug Banner Component - minimal styling for immediate render
const DebugBanner = () => {
  const showBanner = import.meta.env.VITE_DEBUG_BANNER === 'true';
  const bypass = import.meta.env.VITE_ADMIN_TURNSTILE_BYPASS;
  const supa = import.meta.env.VITE_SUPABASE_URL;
  
  console.log('[BOOT] debug flags', { showBanner, bypass, supa });
  
  if (!showBanner) return null;

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,fontSize:12,padding:'6px 10px',background:'#111',color:'#9ef'}}>
      TS BYPASS: {String(bypass)} &nbsp;|&nbsp; SUPABASE: {supa}
    </div>
  );
};

// Enhanced Visit Logger Component
function VisitLogger() {
  const location = useLocation();
  
  // Gate behind environment flag
  if (import.meta.env.VITE_ENABLE_VISIT_LOGGER !== 'true') {
    return null;
  }

  // Only log if this is a public page
  if (shouldLogPage(location.pathname)) {
    try {
      usePublicVisitLogger();
    } catch (error) {
      console.warn('visit logger failed', error);
    }
  }
  
  return null;
}

// App component with non-blocking rendering
const AppContent = () => {
  return (
    <>
      <DebugBanner />
      <VisitLogger />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/lance-seu-ganhavel" element={<LanceSeuGanhavel />} />
        <Route path="/descobrir" element={<Descobrir />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/:categoria" element={<Categorias />} />
        <Route path="/categorias/:categoria/:subcategoria" element={<SubcategoriaGanhaveis />} />
        <Route path="/ganhavel/:id" element={<GanhaveisDetail />} />
        <Route path="/ganhavel/:ganhaveisId/confirmacao-pagamento" element={<ConfirmacaoPagamento />} />
        <Route path="/ganhavel/:ganhaveisId/pagamento-sucesso" element={<PagamentoSucesso />} />
        <Route path="/ganhavel/:ganhaveisId/pagamento-erro" element={<PagamentoErro />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/test-payment" element={<TestPayment />} />
        <Route path="/minha-conta" element={<MinhaConta />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/gerenciar-cartoes-e-pix" element={<GerenciarCartoesEPix />} />
        <Route path="/gerenciar-ganhavel/:id" element={<GerenciarGanhavel />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/guia-do-criador" element={<GuiaDoCriador />} />
        <Route path="/confianca-seguranca" element={<ConfiancaSeguranca />} />
        <Route path="/central-de-ajuda" element={<CentralDeAjuda />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
        <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/proposta-de-investimento" element={<Investment />} />
        <Route path="/business-model" element={<BusinessModel />} />
        {import.meta.env.DEV && (<Route path="/turnstile-test" element={<TurnstileTest />} />)}
        <Route path="/perfil/:username" element={<PerfilPublico />} />
        {/* User dashboard - requires auth but not admin */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin routes - all protected with AdminProtectedRoute */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="ganhaveis" element={<GanhaveisManagement />} />
          <Route path="ganhaveis-concluidos" element={<GanhavelsConcluidos />} />
          <Route path="usuarios" element={<UsersManagement />} />
          <Route path="financeiro" element={<FinancialControl />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="painel" element={<AdminDashboard />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="visits" element={<AdminVisits />} />
        </Route>
        
        {/* Standalone admin routes - also protected */}
        <Route path="/admin-dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin-visits" element={
          <AdminProtectedRoute>
            <AdminVisits />
          </AdminProtectedRoute>
        } />
        {/* Legacy routes for backward compatibility */}
        <Route path="/confirmacao-pagamento" element={<ConfirmacaoPagamento />} />
        <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />
        <Route path="/pagamento-erro" element={<PagamentoErro />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        {/* Dev-only test route, admin-protected */}
        {import.meta.env.DEV && (
          <Route path="/test-audit" element={
            <AdminProtectedRoute>
              <TestAudit />
            </AdminProtectedRoute>
          } />
        )}
        {/* Dev-only debug token */}
        {import.meta.env.DEV && (
          <Route path="/debug-token" element={<DebugToken />} />
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <AppContent />
        </Router>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;