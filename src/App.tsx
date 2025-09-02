import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { I18nextProvider } from 'react-i18next';
import i18n from "@/i18n";
import Index from "./pages/Index";
import DiscoverRaffles from "./pages/DiscoverRaffles";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import SubcategoryDetailPage from "./pages/SubcategoryDetailPage";
import GanhaveisDetail from "./pages/GanhaveisDetail";
import RafflesToGanhavelRedirect from "./components/RafflesToGanhavelRedirect";
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
import AuthHashCallback from "./pages/AuthHashCallback";

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
import RequireAuth from "./components/RequireAuth";
import { usePublicVisitLogger, shouldLogPage } from "@/hooks/usePublicVisitLogger";
import { DevErrorBoundary } from '@/components/DevErrorBoundary';
import { useLocation } from 'react-router-dom';
import GlobalAuthDebugOverlay from '@/components/GlobalAuthDebugOverlay';
import MinimalDashboard from '@/pages/MinimalDashboard';
import Profile from '@/pages/Profile';
import MyTickets from '@/pages/MyTickets';
import Raffles from '@/pages/Raffles';
import MyLaunched from '@/pages/MyLaunched';
import AdminRaffles from '@/pages/admin/AdminRaffles';
import AdminPayouts from '@/pages/AdminPayouts';
import LastPathKeeper from '@/components/LastPathKeeper';
import { useAuthContext } from '@/providers/AuthProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { DebugBanner } from '@/components/DebugBanner';
import DiagnosticsPage from '@/pages/DiagnosticsPage';

function RouteBadge() {
  if (import.meta.env.VITE_DEBUG_OVERLAY !== 'true') return null;
  
  const loc = useLocation();
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 12,
      zIndex: 99999,
      padding: '6px 10px',
      background: '#111',
      color: '#9ef',
      borderRadius: 10,
      fontSize: 12,
    }}>
      {loc.pathname}{loc.hash}
    </div>
  );
}

const queryClient = new QueryClient();

// Legacy Debug Banner - kept for backward compatibility
const LegacyDebugBanner = () => {
  const showBanner = import.meta.env.VITE_DEBUG_BANNER === 'true';
  const bypass = import.meta.env.VITE_ADMIN_TURNSTILE_BYPASS;
  const supa = import.meta.env.VITE_SUPABASE_URL;
  
  console.log('[BOOT] debug flags', { showBanner, bypass, supa });
  
  if (!showBanner) return null;

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,fontSize:12,padding:'6px 10px',background:'#111',color:'#9ef'}}>
      TS BYPASS: {String(bypass)} | SUPABASE: {supa}
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
  const { session } = useAuthContext();
  const isAuthenticated = !!session;

  return (
    <>
      <LastPathKeeper isAuthenticated={isAuthenticated} />
      <LegacyDebugBanner />
      <DebugBanner />
      <VisitLogger />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/lance-seu-ganhavel" element={
          <RequireAuth>
            <LanceSeuGanhavel />
          </RequireAuth>
        } />
        <Route path="/descobrir" element={<DiscoverRaffles />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/categorias/:categorySlug" element={<CategoryDetailPage />} />
        <Route path="/categorias/:categorySlug/:subSlug" element={<SubcategoryDetailPage />} />
        <Route path="/ganhavel/:id" element={<GanhaveisDetail />} />
        {/* Optional alias/redirect for legacy URLs */}
        <Route path="/raffles/:id" element={<RafflesToGanhavelRedirect />} />
        <Route path="/ganhavel/:id/confirmacao-pagamento" element={<ConfirmacaoPagamento />} />
        <Route path="/ganhavel/:ganhaveisId/pagamento-sucesso" element={<PagamentoSucesso />} />
        <Route path="/ganhavel/:ganhaveisId/pagamento-erro" element={<PagamentoErro />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/test-payment" element={<TestPayment />} />
        
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
        <Route path="/dashboard" element={
          <RequireAuth>
            {import.meta.env.VITE_DASH_MINIMAL === 'true' ? <MinimalDashboard /> : <Dashboard />}
          </RequireAuth>
        } />
        
        {/* User profile and related pages - requires auth */}
        <Route path="/profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        } />
        <Route path="/my-tickets" element={
          <RequireAuth>
            <MyTickets />
          </RequireAuth>
        } />
        <Route path="/raffles" element={
          <RequireAuth>
            <Raffles />
          </RequireAuth>
        } />
        <Route path="/my-launched" element={
          <RequireAuth>
            <MyLaunched />
          </RequireAuth>
        } />

        {/* Admin routes - all protected with AdminProtectedRoute */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        }>
          <Route index element={<GanhaveisManagement />} />
          <Route path="ganhaveis" element={<GanhaveisManagement />} />
          <Route path="rifas" element={<AdminRaffles />} />
          <Route path="ganhaveis-concluidos" element={<GanhavelsConcluidos />} />
          <Route path="usuarios" element={<UsersManagement />} />
          <Route path="financeiro" element={<FinancialControl />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="painel" element={<AdminDashboard />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="visits" element={<AdminVisits />} />
          <Route path="payouts" element={<AdminPayouts />} />
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
        {/* OAuth callback routes */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth-callback" element={<AuthHashCallback />} />
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
        {/* Diagnostics page - only visible with ?debug=1 */}
        <Route path="/_diag" element={<DiagnosticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <DevErrorBoundary>
            <Router>
              <GlobalAuthDebugOverlay />
              <RouteBadge />
              <AppContent />
            </Router>
          </DevErrorBoundary>
        </AuthProvider>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;