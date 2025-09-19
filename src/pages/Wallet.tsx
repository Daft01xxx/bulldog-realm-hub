import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, ExternalLink } from "lucide-react";
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from "react";

const Wallet = () => {
  const navigate = useNavigate();
  const wallet = useTonWallet();

  useEffect(() => {
    if (wallet) {
      console.log('Wallet connected:', wallet);
    }
  }, [wallet]);

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
              <span className="text-3xl">👛</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Подключить кошелек
            </h2>
            <p className="text-muted-foreground mb-6">
              {wallet 
                ? `✅ Кошелек подключен!\nАдрес: ${wallet.account.address.slice(0,8)}...${wallet.account.address.slice(-6)}`
                : "Нажмите кнопку ниже чтобы подключить TON кошелек"
              }
            </p>
          </div>

          {wallet ? (
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/connected-wallet")}
                className="button-gold w-full text-lg py-6"
              >
                Открыть кошелек
              </Button>
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Устройство:</p>
                <p className="font-semibold">{wallet.device.appName}</p>
                <p className="text-sm text-muted-foreground mb-1 mt-2">Провайдер:</p>
                <p className="font-semibold">{wallet.provider}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <TonConnectButton className="!w-full !bg-gradient-to-r !from-yellow-400 !to-yellow-600 !text-black !rounded-lg !px-8 !py-6 !font-bold !text-lg !shadow-lg hover:!shadow-xl !transition-all !duration-300" />
              <p className="text-xs text-muted-foreground">
                Поддерживаемые кошельки: Tonkeeper, MyTonWallet, Telegram Wallet
              </p>
            </div>
          )}
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