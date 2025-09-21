import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import FallingCoins2D from "./components/FallingCoins2D";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isOnBanPage = location.pathname === '/ban';

  return (
    <>
      <Toaster />
      <Sonner />
      {!isOnBanPage && <FallingCoins2D />}
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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </TonConnectUIProvider>
  </QueryClientProvider>
);

export default App;