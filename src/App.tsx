import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import FallingCoins2D from "./components/FallingCoins2D";
import GoldenParticles from "./components/GoldenParticles";
import { AuthProvider } from "./hooks/useAuth";
import Welcome from "./pages/Welcome";
import Menu from "./pages/Menu";
import Wallet from "./pages/Wallet";
import ConnectedWallet from "./pages/ConnectedWallet";
import Game from "./pages/Game";
import Info from "./pages/Info";
import Referral from "./pages/Referral";
import Tasks from "./pages/Tasks";
import BdogPay from "./pages/BdogPay";
import Promotion from "./pages/Promotion";
import Admin from "./pages/Admin";
import Ban from "./pages/Ban";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Create QueryClient with proper configuration for React 18
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

function AppContent() {
  const location = useLocation();
  // Temporarily disable profile loading to avoid infinite loading
  // const { profile, loading } = useProfile();
  const isOnBanPage = location.pathname === '/ban';
  const isOnAuthPage = location.pathname === '/auth';
  const banRedirectProcessed = useRef(false);

  // Handle ban redirect only once per session
  // useEffect(() => {
  //   if (profile?.ban === 1 && !isOnBanPage && !banRedirectProcessed.current && !loading) {
  //     banRedirectProcessed.current = true;
  //     // Clear any cached data before redirect
  //     localStorage.clear();
  //     window.location.replace('/ban');
  //   }
  // }, [profile?.ban, isOnBanPage, loading]);

  // Reset ban redirect flag when user navigates away from ban page
  useEffect(() => {
    if (!isOnBanPage) {
      banRedirectProcessed.current = false;
    }
  }, [isOnBanPage]);

  // Temporarily disable loading screen
  // if (loading && !isOnBanPage && !isOnAuthPage) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Загрузка...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <Toaster />
      <Sonner />
      {/* Falling coins only on game and connected wallet pages */}
      {(location.pathname === '/game' || location.pathname === '/connected-wallet') && <FallingCoins2D />}
      
      {/* Golden particles on all pages except ban */}
      {location.pathname !== '/ban' && <GoldenParticles />}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/connected-wallet" element={<ConnectedWallet />} />
        <Route path="/game" element={<Game />} />
        <Route path="/info" element={<Info />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/bdogpay" element={<BdogPay />} />
        <Route path="/promotion" element={<Promotion />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/ban" element={<Ban />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TonConnectUIProvider 
      manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
    >
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </TonConnectUIProvider>
  </QueryClientProvider>
);

export default App;