import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConnectedWallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [nftList, setNftList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const address = localStorage.getItem("bdog-api");
    if (!address) {
      navigate("/wallet");
      return;
    }
    setWalletAddress(address);
    fetchWalletData(address);

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => fetchWalletData(address), 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchWalletData = async (address: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to TonViewer (in real app, you would call the actual API)
      // For demo, we'll use mock data
      const mockBalance = (Math.random() * 10000).toFixed(2);
      const mockNFTs = [
        { id: 1, name: "Bulldog Sticker #1", image: "/api/placeholder/100/100" },
        { id: 2, name: "Bulldog Coin Gold", image: "/api/placeholder/100/100" },
        { id: 3, name: "BDOG NFT Rare", image: "/api/placeholder/100/100" },
      ];

      setBalance(mockBalance);
      setNftList(mockNFTs);
      localStorage.setItem("bdog-balance2", mockBalance);
      
      toast({
        title: "Баланс обновлен",
        description: `Текущий баланс: ${mockBalance} BDOG`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные кошелька",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      {/* Balance card */}
      <Card className="card-glow max-w-md mx-auto p-8 text-center mb-8 animate-bounce-in">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center animate-pulse-gold mr-4">
            <span className="text-2xl">💰</span>
          </div>
          <Button
            onClick={() => fetchWalletData(walletAddress)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="button-outline-gold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Баланс кошелька</h2>
        <p className="text-3xl font-bold text-gradient animate-glow-text">
          {balance} BDOG
        </p>
        <p className="text-sm text-muted-foreground mt-2 break-all">
          {walletAddress}
        </p>
      </Card>

      {/* Purchase buttons */}
      <div className="max-w-md mx-auto grid grid-cols-1 gap-4 mb-8 animate-fade-in-up">
        <Card className="card-glow p-4">
          <Button
            onClick={() => window.open("https://t.me/blum/app?startapp=memepadjetton_BDOG_Y28d0-ref_wg9QjmgoJX", "_blank")}
            className="button-gold w-full group"
          >
            <ExternalLink className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Купить BDOG
          </Button>
        </Card>
        
        <Card className="card-glow p-4">
          <Button
            onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
            className="button-outline-gold w-full group"
          >
            <ExternalLink className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Купить NFT
          </Button>
        </Card>
      </div>

      {/* NFT Collection */}
      <div className="max-w-4xl mx-auto animate-slide-in-right" style={{animationDelay: '0.3s'}}>
        <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
          Ваши NFT
        </h3>
        
        {nftList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nftList.map((nft, index) => (
              <Card 
                key={nft.id} 
                className="card-glow p-4 hover-lift cursor-pointer animate-bounce-in"
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <div className="aspect-square bg-gradient-dark rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl">🖼️</span>
                </div>
                <h4 className="text-sm font-semibold text-foreground text-center">
                  {nft.name}
                </h4>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-glow p-8 text-center">
            <p className="text-muted-foreground">NFT не найдены</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConnectedWallet;