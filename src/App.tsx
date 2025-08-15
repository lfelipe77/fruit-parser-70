import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
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
import AuthHashCallback from "./pages/AuthHashCallback";
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
import RequireAuth from "./components/RequireAuth";
import { usePublicVisitLogger, shouldLogPage } from "@/hooks/usePublicVisitLogger";
import { DevErrorBoundary } from '@/components/DevErrorBoundary';
import { useLocation } from 'react-router-dom';
import GlobalAuthDebugOverlay from '@/components/GlobalAuthDebugOverlay';
import MinimalDashboard from '@/pages/MinimalDashboard';
import MyGanhaveis from '@/pages/MyGanhaveis';
import UserProfile from '@/pages/UserProfile';
import MyTickets from '@/pages/MyTickets';
import Raffles from '@/pages/Raffles';
import MyParticipatingRaffles from '@/pages/MyParticipatingRaffles';
import AdminRaffles from '@/pages/admin/AdminRaffles';
import AdminPayouts from '@/pages/AdminPayouts';
import PublicProfile from '@/pages/PublicProfile';

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

// Debug Banner Component - minimal styling for immediate render
const DebugBanner = () => {
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

const SAFE_MODE = import.meta.env.VITE_SAFE_MODE === "1";

// App component with non-blocking rendering
const AppContent = () => {
  return (
    <>
      <DebugBanner />
      <VisitLogger />
      <ScrollToTop />
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            {import.meta.env.VITE_DASH_MINIMAL === 'true' ? <MinimalDashboard /> : <Dashboard />}
          </RequireAuth>
        } />

        {/* Profile */}
        <Route path="/profile" element={
          <RequireAuth>
            <UserProfile />
          </RequireAuth>
        } />
        <Route path="/profile/ganhaveis" element={
          <RequireAuth>
            <MyGanhaveis />
          </RequireAuth>
        } />
        <Route path="/u/:username" element={<PublicProfile />} />

        {/* Participation vs Catalog */}
        <Route path="/ganhaveis" element={
          <RequireAuth>
            <MyParticipatingRaffles />
          </RequireAuth>
        } />
        <Route path="/raffles/:id" element={<GanhaveisDetail />} />

        {/* Tickets */}
        <Route path="/tickets" element={
          <RequireAuth>
            <MyTickets />
          </RequireAuth>
        } />

        {/* Legacy redirects */}
        <Route path="/minha-conta" element={<Navigate to="/profile/ganhaveis" replace />} />

        {/* Other essential routes */}
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/:slug" element={<SubcategoriaGanhaveis />} />
        <Route path="/descobrir" element={<Descobrir />} />
        <Route path="/confianca-seguranca" element={<ConfiancaSeguranca />} />
        <Route path="/central-de-ajuda" element={<CentralDeAjuda />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
        <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
        <Route path="/guia-do-criador" element={<GuiaDoCriador />} />
        <Route path="/business-model" element={<BusinessModel />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/crowdfunding" element={<CrowdfundingHome />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/auth-callback" element={<AuthHashCallback />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Raffles & Ganhaveis */}
        <Route path="/raffles" element={
          <RequireAuth>
            <Raffles />
          </RequireAuth>
        } />

        {/* Payment Routes */}
        <Route path="/confirmacao-pagamento" element={<ConfirmacaoPagamento />} />
        <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />
        <Route path="/pagamento-erro" element={<PagamentoErro />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* User Protected Routes */}
        <Route path="/gerenciar-ganhavel/:id" element={
          <RequireAuth>
            <GerenciarGanhavel />
          </RequireAuth>
        } />
        <Route path="/lance-seu-ganhavel" element={
          <RequireAuth>
            <LanceSeuGanhavel />
          </RequireAuth>
        } />
        <Route path="/gerenciar-cartoes-e-pix" element={
          <RequireAuth>
            <GerenciarCartoesEPix />
          </RequireAuth>
        } />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/payouts" element={
          <AdminProtectedRoute>
            <AdminPayouts />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/ganhaveis-management" element={
          <AdminProtectedRoute>
            <GanhaveisManagement />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users-management" element={
          <AdminProtectedRoute>
            <UsersManagement />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/fraud-detection" element={
          <AdminProtectedRoute>
            <FraudDetection />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/financial-control" element={
          <AdminProtectedRoute>
            <FinancialControl />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <Settings />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminProtectedRoute>
            <Analytics />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <AdminProtectedRoute>
            <AuditLogs />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/support-tickets" element={
          <AdminProtectedRoute>
            <SupportTickets />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <AdminProtectedRoute>
            <AdminLogs />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/visits" element={
          <AdminProtectedRoute>
            <AdminVisits />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/rate-limits" element={
          <AdminProtectedRoute>
            <AdminRateLimits />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/raffles" element={
          <AdminProtectedRoute>
            <AdminRaffles />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/ganhaveis-concluidos" element={
          <AdminProtectedRoute>
            <GanhavelsConcluidos />
          </AdminProtectedRoute>
        } />

        {/* Debug and Test Routes */}
        {import.meta.env.NODE_ENV !== 'production' && (
          <>
            <Route path="/debug-token" element={<DebugToken />} />
            <Route path="/test-payment" element={<TestPayment />} />
            <Route path="/test-audit" element={<TestAudit />} />
            <Route path="/turnstile-test" element={<TurnstileTest />} />
            <Route path="/minimal-dashboard" element={<MinimalDashboard />} />
          </>
        )}

        {/* Safe Mode: force a minimal page if needed */}
        {SAFE_MODE && <Route path="*" element={<Navigate to="/dashboard" replace />} />}

        {/* Normal 404 */}
        {!SAFE_MODE && (
          <Route
            path="*"
            element={
              <div className="p-6">
                <h1 className="text-xl font-bold">Página não encontrada</h1>
                <a className="underline text-emerald-700" href="#/dashboard">Voltar ao Dashboard</a>
              </div>
            }
          />
        )}

        {/* Special Routes */}
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <DevErrorBoundary>
          <HashRouter>
            <GlobalAuthDebugOverlay />
            <RouteBadge />
            <AppContent />
          </HashRouter>
        </DevErrorBoundary>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;