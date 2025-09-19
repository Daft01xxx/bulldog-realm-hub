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
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold"
        >
          <Home className="w-4 h-4 mr-2" />
          Меню
        </Button>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient animate-glow-text mb-4">
          Кошелёк BDOG
        </h1>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto space-y-8">
        {/* Integration card */}
        <Card className="card-glow p-8 text-center animate-fade-in-up">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-gold rounded-full flex items-center justify-center animate-pulse-gold">
              <WalletIcon className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Интегрировать кошелек
            </h2>
            <p className="text-muted-foreground">
              {isConnected 
                ? `Кошелек подключен: ${walletAddress?.slice(0, 8)}...${walletAddress?.slice(-6)}`
                : "Подключите ваш TON кошелек для просмотра баланса BDOG и NFT"
              }
            </p>
          </div>

          <Button
            onClick={handleConnect}
            className="button-gold w-full text-lg py-6 animate-bounce-in"
          >
            {isConnected ? "Перейти к кошельку" : "Подключить TON кошелек"}
          </Button>
        </Card>

        {/* Quick purchase buttons */}
        <div className="grid grid-cols-1 gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <Card className="card-glow p-6">
            <Button
              onClick={() => window.open("https://t.me/blum/app?startapp=memepadjetton_BDOG_Y28d0-ref_wg9QjmgoJX", "_blank")}
              className="button-gold w-full text-lg py-4 group"
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Купить BDOG
            </Button>
          </Card>
          
          <Card className="card-glow p-6">
            <Button
              onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
              className="button-outline-gold w-full text-lg py-4 group"
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Купить NFT
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;