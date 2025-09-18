import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, RefreshCw, ExternalLink } from "lucide-react";
import { useBdogTonWallet } from "@/hooks/useTonWallet";

const ConnectedWallet = () => {
  const navigate = useNavigate();
  const { 
    isConnected, 
    walletAddress, 
    walletData, 
    loading, 
    refreshWalletData, 
    disconnectWallet 
  } = useBdogTonWallet();

  useEffect(() => {
    if (!isConnected) {
      navigate("/wallet");
    }
  }, [isConnected, navigate]);

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
            onClick={refreshWalletData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="button-outline-gold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Баланс кошелька</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">TON</p>
            <p className="text-xl font-bold text-foreground">
              {loading ? "..." : (walletData?.tonBalance || "0")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">BDOG</p>
            <p className="text-xl font-bold text-gold">
              {loading ? "..." : (walletData?.bdogBalance || "0")}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2 break-all">
          {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : ''}
        </p>
        
        <Button
          variant="outline"
          onClick={disconnectWallet}
          className="button-outline-gold mt-4"
        >
          Отключить кошелек
        </Button>
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
        
        <Card className="card-glow p-6">
          {loading ? (
            <p className="text-center text-muted-foreground">Загрузка NFT...</p>
          ) : walletData?.nfts && walletData.nfts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {walletData.nfts.map((nft, index) => (
                <div 
                  key={nft.id} 
                  className="bg-secondary/20 rounded-lg p-3 hover:bg-secondary/30 transition-colors animate-bounce-in"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  {nft.image ? (
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full aspect-square rounded-lg object-cover mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-gold rounded-lg flex items-center justify-center mb-2">
                      <span className="text-4xl">🖼️</span>
                    </div>
                  )}
                  <h4 className="text-sm font-semibold text-foreground text-center">
                    {nft.name}
                  </h4>
                  <p className="text-xs text-muted-foreground text-center">
                    {nft.collection}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              NFT не найдены в вашем кошельке
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ConnectedWallet;