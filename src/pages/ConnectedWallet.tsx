import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  Send, 
  History, 
  Wallet as WalletIcon,
  Image as ImageIcon,
  TrendingUp,
  Coins,
  Clock,
  CheckCircle
} from "lucide-react";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import TonLogoNoBackground from "@/components/TonLogoNoBackground";
import bdogLogoTransparent from "@/assets/bulldog-logo-transparent.png";

const ConnectedWallet = () => {
  const navigate = useNavigate();
  const { walletAddress, isConnected, disconnectWallet, walletData } = useBdogTonWallet();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wallet");

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected || !walletAddress) {
      navigate("/wallet");
    }
  }, [isConnected, walletAddress, navigate]);

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Адрес скопирован",
        description: "Адрес кошелька скопирован в буфер обмена",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    navigate("/menu");
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString("ru-RU", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 4 
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (!isConnected || !walletAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4 pt-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/menu")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Меню
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Кошелёк</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="text-muted-foreground hover:text-destructive"
          >
            Отключить
          </Button>
        </div>
      </div>

      {/* BDOG Balance Display */}
      <div className="px-4 pt-4">
        <Card className="bg-white text-black border-none shadow-lg">
          <div className="p-4 text-center">
            <div className="text-sm font-medium text-black/70 mb-1">BDOG Баланс</div>
            <div className="text-2xl font-bold text-black">
              {formatBalance(parseFloat(walletData?.bdogBalance || "0"))}
            </div>
            <div className="text-xs text-black/50 mt-1">BDOG Tokens</div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Wallet Tab Content */}
          <TabsContent value="wallet" className="px-4 pt-2 space-y-6">
            {/* Wallet Address Card */}
            <Card className="card-tonkeeper p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <WalletIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Мой кошелёк</h3>
                    <p className="text-sm text-muted-foreground">TON Wallet</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                  Подключен
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                <span className="font-mono text-sm text-foreground">
                  {formatAddress(walletAddress)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="text-gold hover:text-gold-light hover:bg-gold/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* TON Balance */}
              <Card className="card-tonkeeper p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <TonLogoNoBackground size="md" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">TON</h4>
                      <p className="text-xs text-muted-foreground">Toncoin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      {formatBalance(parseFloat(walletData?.tonBalance || "0"))}
                    </p>
                    <p className="text-xs text-muted-foreground">TON</p>
                  </div>
                </div>
              </Card>

              {/* V-BDOG Balance */}
              <Card className="balance-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src={bdogLogoTransparent} 
                        alt="V-BDOG" 
                        width="24"
                        height="24"
                        className="w-6 h-6 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">V-BDOG</h4>
                      <p className="text-xs text-muted-foreground">Виртуальный BDOG</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gold">
                      {formatBalance(profile?.v_bdog_earned || 0)}
                    </p>
                    <p className="text-xs text-gold-muted">V-BDOG</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => window.open("https://t.me/blum/app?startapp=memepadjetton_BDOG_Y28d0-ref_wg9QjmgoJX", "_blank")}
                className="button-tonkeeper-primary h-14 text-base"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Купить BDOG
              </Button>
              
              <Button
                onClick={() => navigate("/bdogpay")}
                className="button-tonkeeper-secondary h-14 text-base"
              >
                <Send className="w-5 h-5 mr-2" />
                Отправить BDOG
              </Button>
            </div>

            {/* NFT Quick Preview */}
            <Card className="card-tonkeeper p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">NFT Коллекция</h4>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  {walletData?.nfts?.length || 0} NFT
                </Badge>
              </div>
              
              {walletData?.nfts && walletData.nfts.length > 0 ? (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {walletData.nfts.slice(0, 4).map((nft, index) => (
                    <div key={index} className="flex-shrink-0">
                      <div className="w-16 h-16 bg-surface-elevated rounded-lg flex items-center justify-center">
                        {nft.image ? (
                          <img 
                            src={nft.image} 
                            alt={nft.name} 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                  {walletData.nfts.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-surface-elevated rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">+{walletData.nfts.length - 4}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">NFT не найдены</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
                    className="text-gold border-gold/40 hover:bg-gold/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Купить NFT
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

            <TabsContent value="history" className="px-4 pt-6">
              <Card className="card-tonkeeper p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">История транзакций</h3>
                </div>
                
                <div className="space-y-3">
                  {walletData?.walletInfo?.transactionHistory?.length > 0 ? (
                    walletData.walletInfo.transactionHistory.map((tx: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'in' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {tx.type === 'in' ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <Send className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {tx.type === 'in' ? 'Получено' : 'Отправлено'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            tx.type === 'in' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {tx.type === 'in' ? '+' : '-'}{tx.amount} {tx.currency}
                          </p>
                          {tx.fee && (
                            <p className="text-xs text-muted-foreground">
                              Комиссия: {tx.fee} TON
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">История загружается</h4>
                      <p className="text-sm text-muted-foreground">
                        Все транзакции подключенного кошелька будут отображаться здесь
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

          {/* Collections Tab Content */}
          <TabsContent value="collections" className="px-4 pt-6">
            <Card className="card-tonkeeper p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">NFT Коллекции</h3>
              </div>
              
              {walletData?.nfts && walletData.nfts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {walletData.nfts.map((nft, index) => (
                    <Card key={index} className="surface-elevated p-4 hover:border-gold/30 transition-colors">
                      <div className="aspect-square bg-surface-muted rounded-lg mb-3 overflow-hidden">
                        {nft.image ? (
                          <img 
                            src={nft.image} 
                            alt={nft.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground text-sm truncate mb-1">
                        {nft.name || `NFT #${index + 1}`}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {nft.collection || "BDOG Collection"}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-foreground mb-2">NFT не найдены</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Подключите кошелёк с NFT или приобретите их
                  </p>
                  <Button
                    onClick={() => window.open("https://getgems.io/collection/EQBBQyriB8oloKQbrumUgvmyQF5iFweNInGHPio0PB_kbVDQ", "_blank")}
                    className="button-tonkeeper-primary"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Купить NFT
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex flex-col items-center py-4 px-2 transition-colors ${
              activeTab === "history" 
                ? "text-gold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">История</span>
          </button>
          
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 flex flex-col items-center py-4 px-2 transition-colors ${
              activeTab === "wallet" 
                ? "text-gold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <WalletIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Кошелёк</span>
          </button>
          
          <button
            onClick={() => setActiveTab("collections")}
            className={`flex-1 flex flex-col items-center py-4 px-2 transition-colors ${
              activeTab === "collections" 
                ? "text-gold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Коллекции</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectedWallet;