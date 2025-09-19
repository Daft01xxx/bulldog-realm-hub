import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Menu from "./pages/Menu";
import Wallet from "./pages/Wallet";
import ConnectedWallet from "./pages/ConnectedWallet";
import Game from "./pages/Game";
import Info from "./pages/Info";
import Referral from "./pages/Referral";
import Promotion from "./pages/Promotion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const manifestUrl = {
  url: "https://746a55f0-1982-4167-ae0e-5312b0711d07.lovableproject.com",
  name: "BDOG Crypto Game",
  iconUrl: "https://746a55f0-1982-4167-ae0e-5312b0711d07.lovableproject.com/favicon.ico",
  termsOfUseUrl: "https://746a55f0-1982-4167-ae0e-5312b0711d07.lovableproject.com",
  privacyPolicyUrl: "https://746a55f0-1982-4167-ae0e-5312b0711d07.lovableproject.com"
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TonConnectUIProvider 
      manifestUrl={`data:application/json,${encodeURIComponent(JSON.stringify(manifestUrl))}`}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/connected-wallet" element={<ConnectedWallet />} />
            <Route path="/game" element={<Game />} />
            <Route path="/info" element={<Info />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/promotion" element={<Promotion />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TonConnectUIProvider>
  </QueryClientProvider>
);

export default App;