
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { I18nextProvider } from 'react-i18next';
import i18n from "@/i18n";
import './index.css';
import './i18n';
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
import AdminRaffles from '@/pages/admin/AdminRaffles';
import AdminPayouts from '@/pages/AdminPayouts';
import LastPathKeeper from '@/components/LastPathKeeper';
import { useAuth } from '@/hooks/useAuth';
import { Safe } from '@/components/Safe';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on certain errors
        if (error && typeof error === 'object' && 'status' in error) {
          if ([401, 403, 404].includes(error.status as number)) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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

// App component with non-blocking rendering
const AppContent = () => {
  const { session } = useAuth();
  const isAuthenticated = !!session;

  return (
    <>
      <Safe>
        <LastPathKeeper isAuthenticated={isAuthenticated} />
      </Safe>
      <Safe>
        <DebugBanner />
      </Safe>
      <Safe>
        <VisitLogger />
      </Safe>
      <Safe>
        <ScrollToTop />
      </Safe>
      <Routes>
        <Route path="/" element={<Safe><Index /></Safe>} />
        <Route path="/auth/callback" element={<Safe><AuthCallback /></Safe>} />
        <Route path="/lance-seu-ganhavel" element={<Safe><LanceSeuGanhavel /></Safe>} />
        <Route path="/descobrir" element={<Safe><DiscoverRaffles /></Safe>} />
        <Route path="/resultados" element={<Safe><Resultados /></Safe>} />
        <Route path="/categorias" element={<Safe><CategoriesPage /></Safe>} />
        <Route path="/categorias/:categorySlug" element={<Safe><CategoryDetailPage /></Safe>} />
        <Route path="/categorias/:categorySlug/:subSlug" element={<Safe><SubcategoryDetailPage /></Safe>} />
        <Route path="/ganhavel/:id" element={<Safe><GanhaveisDetail /></Safe>} />
        <Route path="/raffles/:id" element={<Safe><RafflesToGanhavelRedirect /></Safe>} />
        <Route path="/ganhavel/:id/confirmacao-pagamento" element={<Safe><ConfirmacaoPagamento /></Safe>} />
        <Route path="/ganhavel/:ganhaveisId/pagamento-sucesso" element={<Safe><PagamentoSucesso /></Safe>} />
        <Route path="/ganhavel/:ganhaveisId/pagamento-erro" element={<Safe><PagamentoErro /></Safe>} />
        <Route path="/cadastro" element={<Safe><SignUp /></Safe>} />
        <Route path="/login" element={<Safe><Login /></Safe>} />
        <Route path="/esqueci-senha" element={<Safe><EsqueciSenha /></Safe>} />
        <Route path="/reset-password" element={<Safe><ResetPassword /></Safe>} />
        <Route path="/payment-success" element={<Safe><PaymentSuccess /></Safe>} />
        <Route path="/test-payment" element={<Safe><TestPayment /></Safe>} />
        
        <Route path="/alterar-senha" element={<Safe><AlterarSenha /></Safe>} />
        <Route path="/gerenciar-cartoes-e-pix" element={<Safe><GerenciarCartoesEPix /></Safe>} />
        <Route path="/gerenciar-ganhavel/:id" element={<Safe><GerenciarGanhavel /></Safe>} />
        <Route path="/como-funciona" element={<Safe><ComoFunciona /></Safe>} />
        <Route path="/guia-do-criador" element={<Safe><GuiaDoCriador /></Safe>} />
        <Route path="/confianca-seguranca" element={<Safe><ConfiancaSeguranca /></Safe>} />
        <Route path="/central-de-ajuda" element={<Safe><CentralDeAjuda /></Safe>} />
        <Route path="/sobre-nos" element={<Safe><SobreNos /></Safe>} />
        <Route path="/trabalhe-conosco" element={<Safe><TrabalheConosco /></Safe>} />
        <Route path="/investment" element={<Safe><Investment /></Safe>} />
        <Route path="/proposta-de-investimento" element={<Safe><Investment /></Safe>} />
        <Route path="/business-model" element={<Safe><BusinessModel /></Safe>} />
        {import.meta.env.DEV && (<Route path="/turnstile-test" element={<Safe><TurnstileTest /></Safe>} />)}
        <Route path="/perfil/:username" element={<Safe><PerfilPublico /></Safe>} />
        
        <Route path="/dashboard" element={
          <Safe>
            <RequireAuth>
              {import.meta.env.VITE_DASH_MINIMAL === 'true' ? <MinimalDashboard /> : <Dashboard />}
            </RequireAuth>
          </Safe>
        } />
        
        <Route path="/profile" element={
          <Safe>
            <RequireAuth>
              <Profile />
            </RequireAuth>
          </Safe>
        } />
        <Route path="/my-tickets" element={
          <Safe>
            <RequireAuth>
              <MyTickets />
            </RequireAuth>
          </Safe>
        } />
        <Route path="/raffles" element={
          <Safe>
            <RequireAuth>
              <Raffles />
            </RequireAuth>
          </Safe>
        } />

        <Route path="/admin" element={
          <Safe>
            <AdminProtectedRoute>
              <Admin />
            </AdminProtectedRoute>
          </Safe>
        }>
          <Route index element={<Safe><GanhaveisManagement /></Safe>} />
          <Route path="ganhaveis" element={<Safe><GanhaveisManagement /></Safe>} />
          <Route path="rifas" element={<Safe><AdminRaffles /></Safe>} />
          <Route path="ganhaveis-concluidos" element={<Safe><GanhavelsConcluidos /></Safe>} />
          <Route path="usuarios" element={<Safe><UsersManagement /></Safe>} />
          <Route path="financeiro" element={<Safe><FinancialControl /></Safe>} />
          <Route path="analytics" element={<Safe><Analytics /></Safe>} />
          <Route path="logs" element={<Safe><AdminLogs /></Safe>} />
          <Route path="audit-logs" element={<Safe><AuditLogs /></Safe>} />
          <Route path="painel" element={<Safe><AdminDashboard /></Safe>} />
          <Route path="configuracoes" element={<Safe><Settings /></Safe>} />
          <Route path="visits" element={<Safe><AdminVisits /></Safe>} />
          <Route path="payouts" element={<Safe><AdminPayouts /></Safe>} />
        </Route>
        
        <Route path="/admin-dashboard" element={
          <Safe>
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          </Safe>
        } />
        <Route path="/admin-visits" element={
          <Safe>
            <AdminProtectedRoute>
              <AdminVisits />
            </AdminProtectedRoute>
          </Safe>
        } />
        
        <Route path="/confirmacao-pagamento" element={<Safe><ConfirmacaoPagamento /></Safe>} />
        <Route path="/pagamento-sucesso" element={<Safe><PagamentoSucesso /></Safe>} />
        <Route path="/pagamento-erro" element={<Safe><PagamentoErro /></Safe>} />
        <Route path="/access-denied" element={<Safe><AccessDenied /></Safe>} />
        <Route path="/auth/callback" element={<Safe><AuthCallback /></Safe>} />
        <Route path="/auth-callback" element={<Safe><AuthHashCallback /></Safe>} />
        
        {import.meta.env.DEV && (
          <Route path="/test-audit" element={
            <Safe>
              <AdminProtectedRoute>
                <TestAudit />
              </AdminProtectedRoute>
            </Safe>
          } />
        )}
        {import.meta.env.DEV && (
          <Route path="/debug-token" element={<Safe><DebugToken /></Safe>} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
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
          <Safe>
            <GlobalAuthDebugOverlay />
          </Safe>
          <Safe>
            <RouteBadge />
          </Safe>
          <Safe>
            <AppContent />
          </Safe>
        </DevErrorBoundary>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
