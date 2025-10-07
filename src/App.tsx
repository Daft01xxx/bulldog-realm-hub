import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef, lazy, Suspense } from "react";
import { useDevicePerformance } from "./hooks/useDevicePerformance";
import PageTransition from "./components/LazyPageTransition";
import { AudioManager } from "./components/AudioManager";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/ThemeProvider";
import { ProfileProvider } from "./components/ProfileProvider";
import AutoMinerRewards from "./components/AutoMinerRewards";

// Lazy load ALL page components for better code splitting and performance
const Index = lazy(() => import("./pages/Index"));
const Welcome = lazy(() => import("./pages/Welcome"));
const LanguageSelect = lazy(() => import("./pages/LanguageSelect"));
const BdogId = lazy(() => import("./pages/BdogId"));
const Menu = lazy(() => import("./pages/Menu"));
const Wallet = lazy(() => import("./pages/Wallet"));
const ConnectedWallet = lazy(() => import("./pages/ConnectedWallet"));
const Game = lazy(() => import("./pages/Game"));
const Miner = lazy(() => import("./pages/Miner"));
const Info = lazy(() => import("./pages/Info"));
const Referral = lazy(() => import("./pages/Referral"));
const Tasks = lazy(() => import("./pages/Tasks"));
const BdogPay = lazy(() => import("./pages/BdogPay"));
const Promotion = lazy(() => import("./pages/Promotion"));
const Admin = lazy(() => import("./pages/Admin"));
const Ban = lazy(() => import("./pages/Ban"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load heavy visual components
const FallingCoins2D = lazy(() => import("./components/FallingCoins2D"));
const FloatingParticles = lazy(() => import("./components/FloatingParticles"));
const FloatingCosmicCoins = lazy(() => import("./components/FloatingCosmicCoins"));
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { reduceAnimations, disableAllAnimations, isMobile, isVeryLowEnd } = useDevicePerformance();
  // Temporarily disable profile loading to avoid infinite loading
  // const { profile, loading } = useProfile();
  const isOnBanPage = location.pathname === '/ban';
  const isOnAuthPage = location.pathname === '/auth';
  const banRedirectProcessed = useRef(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      <Suspense fallback={null}>
        {!disableAllAnimations && <FloatingCosmicCoins count={isVeryLowEnd ? 3 : isMobile ? 6 : 12} />}
      </Suspense>
      <AudioManager backgroundMusic={false} volume={isMobile ? 0.05 : 0.1} />
      <AutoMinerRewards />
      {!isVeryLowEnd && (
        <Suspense fallback={null}>
          {!disableAllAnimations && <FloatingParticles count={isVeryLowEnd ? 2 : isMobile ? 4 : 8} />}
        </Suspense>
      )}
      <Toaster />
      <Sonner />
      {!isVeryLowEnd && (
        <Suspense fallback={null}>
          {location.pathname === '/menu' && !disableAllAnimations && <FallingCoins2D count={isVeryLowEnd ? 2 : isMobile ? 3 : 8} />}
        </Suspense>
      )}
      <PageTransition>
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/language-select" element={<LanguageSelect />} />
            <Route path="/bdog-id" element={<BdogId />} />
            <Route path="/index" element={<Index />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/connected-wallet" element={<ConnectedWallet />} />
            <Route path="/game" element={<Game />} />
            <Route path="/miner" element={<Miner />} />
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
        </Suspense>
      </PageTransition>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TonConnectUIProvider 
      manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
    >
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ProfileProvider>
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </ProfileProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </TonConnectUIProvider>
  </QueryClientProvider>
);

export default App;