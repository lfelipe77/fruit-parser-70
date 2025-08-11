
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import GanhaveisDetail from "./pages/GanhaveisDetail";
import Resultados from "./pages/Resultados";
import Categorias from "./pages/Categorias";
import SubcategoriaGanhaveis from "./pages/SubcategoriaGanhaveis";
import Descobrir from "./pages/Descobrir";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import MinhaConta from "./pages/MinhaConta";
import ComoFunciona from "./pages/ComoFunciona";
import GuiaDoCriador from "./pages/GuiaDoCriador";
import CentralDeAjuda from "./pages/CentralDeAjuda";
import SobreNos from "./pages/SobreNos";
import TrabalheConosco from "./pages/TrabalheConosco";
import Investment from "./pages/Investment";
import ConfiancaSeguranca from "./pages/ConfiancaSeguranca";
import PerfilPublico from "./pages/PerfilPublico";
import ConfirmacaoPagamento from "./pages/ConfirmacaoPagamento";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoErro from "./pages/PagamentoErro";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import TestAudit from "./pages/TestAudit";
import DebugToken from "./pages/DebugToken";
import LanceSeuGanhavel from "./pages/LanceSeuGanhavel";
import GerenciarGanhavel from "./pages/GerenciarGanhavel";
import GerenciarCartoesEPix from "./pages/GerenciarCartoesEPix";
import AlterarSenha from "./pages/AlterarSenha";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import GanhaveisManagement from "./pages/admin/GanhaveisManagement";
import GanhavelsConcluidos from "./pages/admin/GanhavelsConcluidos";
import UsersManagement from "./pages/admin/UsersManagement";
import FinancialControl from "./pages/admin/FinancialControl";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminVisits from "./pages/admin/AdminVisits";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import TurnstileTest from "./pages/TurnstileTest";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { usePublicVisitLogger, shouldLogPage } from "@/hooks/usePublicVisitLogger";

const queryClient = new QueryClient();

// Component to handle visit logging
function VisitLogger() {
  const location = useLocation();
  
  // Only log if this is a public page
  if (shouldLogPage(location.pathname)) {
    usePublicVisitLogger();
  }
  
  return null;
}

// App component with visit logging
const AppContent = () => {
  const location = useLocation();
  
  // Only log if this is a public page
  if (shouldLogPage(location.pathname)) {
    usePublicVisitLogger();
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
          <Route path="/" element={<Index />} />
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
          <Route path="/turnstile-test" element={<TurnstileTest />} />
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
          {/* Temporary test route - remove after verifying */}
          <Route path="/test-audit" element={<TestAudit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {import.meta.env.MODE !== 'production' && (
            <Route path="/debug-token" element={<DebugToken />} />
          )}
         <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
