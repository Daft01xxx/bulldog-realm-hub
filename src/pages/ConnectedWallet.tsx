import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, RefreshCw, ExternalLink, Unplug, Image, Gamepad2 } from "lucide-react";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import tonCustomLogo from "@/assets/ton-custom-logo.png";
import bdogLogo from "@/assets/bdog-logo.png";

const ConnectedWallet = () => {
  const navigate = useNavigate();
  const { 
    isConnected, 
    walletAddress, 
    walletData, 
    loading, 
    disconnectWallet, 
    refreshWalletData,
    profile,
    autoRefresh,
    setAutoRefresh
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

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient animate-glow-text mb-4">
          Подключенный кошелёк
        </h1>
      </div>

      {/* Wallet Info Section */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Wallet Address Card */}
        <Card className="card-glow p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gradient">Информация о кошельке</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`${autoRefresh ? "button-gold" : "button-outline-gold"} text-xs sm:text-sm whitespace-nowrap`}
              >
                Авто-обновление {autoRefresh ? "ВКЛ" : "ВЫКЛ"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshWalletData}
                disabled={loading}
                className="button-outline-gold text-xs sm:text-sm whitespace-nowrap"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Адрес кошелька:</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
              {walletData?.walletInfo && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Статус:</p>
                    <p className={walletData.walletInfo.isActive ? "text-green-400" : "text-gold"}>
                      {walletData.walletInfo.isActive ? "Активный" : "Неактивный"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">NFT:</p>
                    <p className="text-foreground">{walletData.walletInfo.nftCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Последняя синхронизация:</p>
                    <p className="text-foreground">
                      {walletData.walletInfo.lastSync ? 
                        new Date(walletData.walletInfo.lastSync).toLocaleTimeString('ru-RU') : 
                        '-'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Короткий адрес:</p>
                    <p className="font-mono text-foreground">{walletData.walletInfo.shortAddress}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-muted/20">
                <Button
                  onClick={disconnectWallet}
                  variant="destructive"
                  size="sm"
                  className="hover-lift"
                >
                  <Unplug className="w-4 h-4 mr-2" />
                  Отключить кошелек
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Balance card */}
        <Card className="card-glow p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gradient">Балансы</h2>
            {walletData?.lastUpdated && (
              <p className="text-sm text-muted-foreground">
                Обновлено: {new Date(walletData.lastUpdated).toLocaleString('ru-RU')}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current wallet balances */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Текущий баланс кошелька</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg hover-lift">
                  <div>
                    <p className="text-sm text-muted-foreground">TON</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? '...' : walletData?.tonBalance || '0.0000'}
                    </p>
                  </div>
                  <div className="text-right">
                    <img 
                      src={tonCustomLogo} 
                      alt="TON" 
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: 'transparent',
                        mixBlendMode: 'multiply'
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg hover-lift">
                  <div>
                    <p className="text-sm text-muted-foreground">BDOG</p>
                    <p className="text-2xl font-bold text-gradient">
                      {loading ? '...' : walletData?.bdogBalance || '0'}
                    </p>
                  </div>
                  <div className="text-right">
                    <img src={bdogLogo} alt="BDOG" className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Preserved profile balances */}
            {profile && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Сохраненные балансы</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Внутриигровые BDOG</p>
                      <p className="text-xl font-bold text-gradient">
                        {profile.balance2?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Gamepad2 className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Purchase buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <Card className="card-glow p-6">
            <Button
              onClick={() => window.open("https://t.me/blum/app?startapp=memepadjetton_BDOG_Y28d0-ref_wg9QjmgoJX", "_blank")}
              className="button-gold w-full text-lg py-4 group hover-lift"
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Купить BDOG токены
            </Button>
          </Card>
          
          <Card className="card-glow p-6">
            <Button
              onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
              className="button-outline-gold w-full text-lg py-4 group hover-lift"
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Купить BDOG NFT
            </Button>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="card-glow p-6 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gradient">История транзакций</h2>
          </div>
          
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Скоро здесь будут отображаться ваши последние транзакции в сети TON
            </p>
          </div>
        </Card>

        {/* NFT Collection */}
        <Card className="card-glow p-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gradient">NFT Коллекция</h2>
            <div className="flex items-center gap-2">
              {walletData?.nfts && (
                <span className="text-sm text-muted-foreground">
                  {walletData.nfts.length} NFT найдено
                </span>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted/20 rounded-lg animate-pulse">
                  <div className="w-full h-32 bg-muted/40 rounded mb-3"></div>
                  <div className="h-4 bg-muted/40 rounded mb-2"></div>
                  <div className="h-3 bg-muted/40 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : walletData?.nfts && walletData.nfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {walletData.nfts.map((nft) => (
                 <div key={nft.id} className="p-4 bg-muted/20 rounded-lg hover-lift transition-all duration-300">
                   <div className="w-full h-32 bg-muted/40 rounded mb-3 flex items-center justify-center relative">
                     {nft.image ? (
                       <img 
                         src={nft.image} 
                         alt={nft.name} 
                         className="w-full h-full object-contain rounded"
                         onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.style.display = 'none';
                           const placeholder = target.nextElementSibling as HTMLElement;
                           if (placeholder) {
                             placeholder.style.display = 'flex';
                           }
                         }}
                       />
                     ) : (
                       <div className="text-4xl flex items-center justify-center">
                         <Image className="w-16 h-16 text-white" />
                       </div>
                     )}
                   </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground break-words min-w-0">{nft.name}</h3>
                        {nft.verified && <span className="text-xs flex-shrink-0">✅</span>}
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{nft.collection}</p>
                      {nft.description && (
                        <p className="text-xs text-muted-foreground break-words">{nft.description}</p>
                      )}
                    </div>
                 </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <Image className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">NFT не найдены</h3>
              <p className="text-muted-foreground mb-6">
                В вашем кошельке пока нет NFT
              </p>
              <Button
                onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
                className="button-gold hover-lift"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Купить первый NFT
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ConnectedWallet;