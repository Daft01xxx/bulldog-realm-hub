import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, ExternalLink, Wallet as WalletIcon } from "lucide-react";
import { useBdogTonWallet } from "@/hooks/useTonWallet";

const Wallet = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, connectWallet, connectionRestored } = useBdogTonWallet();

  // Monitor wallet connection and auto-redirect
  useEffect(() => {
    console.log('Wallet connection status changed:', { isConnected, walletAddress, connectionRestored });
    
    if (isConnected && walletAddress && connectionRestored) {
      console.log('Auto-redirecting to connected wallet page');
      setTimeout(() => {
        navigate("/connected-wallet");
      }, 1000); // Small delay to ensure everything is loaded
    }
  }, [isConnected, walletAddress, connectionRestored, navigate]);

  const handleConnect = async () => {
    console.log('handleConnect called, isConnected:', isConnected, 'walletAddress:', walletAddress);
    
    if (isConnected && walletAddress) {
      console.log('Navigating to connected-wallet');
      navigate("/connected-wallet");
    } else {
      console.log('Opening wallet modal');
      await connectWallet();
    }
  };

  // Show loading while connection is being restored
  if (!connectionRestored) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground mt-4">Инициализация кошелька...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-gold/5 px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold shadow-gold"
        >
          <ArrowLeft className="w-4 h-4 mr-2 icon-gold" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold shadow-gold"
        >
          <Home className="w-4 h-4 mr-2 icon-gold" />
          Меню
        </Button>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-glow-text mb-4">
            Кошелёк BDOG
          </h1>
          <p className="text-lg text-muted-foreground">
            Управляй своими токенами и NFT
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Connection Status Card */}
        <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-2 border-gold/30 p-10 text-center animate-fade-in-up hover:border-gold/60 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"></div>
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-2xl animate-pulse-gold">
              <WalletIcon className="w-12 h-12 text-black" />
            </div>
            
            <h2 className="text-3xl font-bold text-gradient mb-4">
              {isConnected ? "🔗 Кошелек подключен" : "🔌 Подключить кошелек"}
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {isConnected 
                ? `Адрес: ${walletAddress?.slice(0, 12)}...${walletAddress?.slice(-8)}`
                : "Подключи свой TON кошелек для управления BDOG токенами и NFT"
              }
            </p>

            <Button
              onClick={handleConnect}
              className="button-gold text-xl py-6 px-12 animate-bounce-in shadow-2xl hover:shadow-gold/30 transition-all duration-300"
            >
              {isConnected ? "🚀 Открыть кошелек" : "⚡ Подключить TON"}
            </Button>
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-2 border-blue-500/30 p-8 hover:border-blue-500/60 transition-all duration-500 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent group-hover:from-blue-500/20"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Купить BDOG</h3>
              <Button
                onClick={() => window.open("https://t.me/blum/app?startapp=memepadjetton_BDOG_Y28d0-ref_wg9QjmgoJX", "_blank")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg"
              >
                Открыть Blum
              </Button>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-2 border-purple-500/30 p-8 hover:border-purple-500/60 transition-all duration-500 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent group-hover:from-purple-500/20"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">NFT Collection</h3>
              <Button
                onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg"
              >
                Открыть GetGems
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;