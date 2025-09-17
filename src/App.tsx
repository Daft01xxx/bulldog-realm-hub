import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
