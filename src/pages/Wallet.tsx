import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, ExternalLink } from "lucide-react";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import bulldogGoldCoin from "@/assets/bulldog-gold-coin.jpeg";
import tonLogo from "@/assets/ton-logo.svg";

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-gold/5 px-2 py-4">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold text-xs px-2 py-1"
        >
          <ArrowLeft className="w-3 h-3 mr-1 text-gold" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold text-xs px-2 py-1"
        >
          <Home className="w-3 h-3 mr-1 text-gold" />
          Меню
        </Button>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient animate-glow-text mb-2">
            Кошелёк BDOG
          </h1>
          <p className="text-sm text-muted-foreground">
            Управляй своими токенами и NFT
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-sm mx-auto space-y-4">
        {/* Connection Status Card */}
        <Card className="card-glow p-6 text-center animate-fade-in-up">
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
              <img 
                src={tonLogo} 
                alt="TON Logo" 
                className="w-12 h-12 filter brightness-0 invert"
              />
            </div>
            
            <h2 className="text-xl font-bold text-gradient mb-3">
              {isConnected ? "🔗 Кошелек подключен" : "🔌 Подключить кошелек"}
            </h2>
            
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {isConnected 
                ? `Адрес: ${walletAddress?.slice(0, 8)}...${walletAddress?.slice(-6)}`
                : "Подключи свой TON кошелек для управления BDOG токенами и NFT"
              }
            </p>

            <Button
              onClick={handleConnect}
              className="button-gold text-base py-3 px-6 animate-bounce-in"
            >
              {isConnected ? "🚀 Открыть кошелек" : "⚡ Подключить TON"}
            </Button>
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-3 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <Card className="card-glow p-4 hover-lift group">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold mb-2 group-hover:text-blue-400 transition-colors">Купить BDOG</h3>
              <Button
                onClick={() => window.open("https://t.me/blum/app?startapp=memepadjetton_BDOG_Y28d0-ref_wg9QjmgoJX", "_blank")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 text-xs px-3 py-1"
              >
                Открыть Blum
              </Button>
            </div>
          </Card>
          
          <Card className="card-glow p-4 hover-lift group">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold mb-2 group-hover:text-purple-400 transition-colors">NFT Collection</h3>
              <Button
                onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 text-xs px-3 py-1"
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