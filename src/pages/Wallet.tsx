import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

const Wallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProfile } = useProfile();
  const [walletAddress, setWalletAddress] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleConnect = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите адрес кошелька",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update profile with wallet address
      await updateProfile({ wallet_address: walletAddress.trim() });
      
      localStorage.setItem("bdog-api", walletAddress.trim());
      
      toast({
        title: "Успешно!",
        description: "Кошелек подключен",
      });
      
      navigate("/connected-wallet");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключить кошелек",
        variant: "destructive",
      });
    }
  };

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
              Интегрировать кошелек
            </h2>
            <p className="text-muted-foreground">
              Подключите ваш TON кошелек для просмотра баланса BDOG и NFT
            </p>
          </div>

          {!showInput ? (
            <Button
              onClick={() => setShowInput(true)}
              className="button-gold w-full text-lg py-6 animate-bounce-in"
            >
              Интегрировать кошелек
            </Button>
          ) : (
            <div className="space-y-4 animate-slide-in-right">
              <Input
                type="text"
                placeholder="Введите адрес TON кошелька"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="text-lg py-6 bg-secondary border-gold/30 focus:border-gold text-foreground"
              />
              <Button
                onClick={handleConnect}
                disabled={!walletAddress.trim()}
                className="button-gold w-full text-lg py-6"
              >
                Подключить
              </Button>
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