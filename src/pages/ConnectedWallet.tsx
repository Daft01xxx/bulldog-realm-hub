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
  CheckCircle,
  Trophy
} from "lucide-react";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import customLogo from "@/assets/custom-logo.png";
import bdogLogo from "@/assets/bdog-logo.jpeg";

const ConnectedWallet = () => {
  const navigate = useNavigate();
  const { walletAddress, isConnected, disconnectWallet, walletData } = useBdogTonWallet();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wallet");
  const [topBdogUsers, setTopBdogUsers] = useState<{name: string, balance: number, address: string}[]>([]);

  // Load top BDOG users
  useEffect(() => {
    loadTopBdogUsers();
  }, []);

  const loadTopBdogUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('reg, bdog_balance, wallet_address')
        .not('wallet_address', 'is', null)
        .gt('bdog_balance', 0)
        .order('bdog_balance', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (users) {
        const formattedUsers = users.map((user: any) => ({
          name: user.reg || "Аноним",
          balance: Number(user.bdog_balance) || 0,
          address: user.wallet_address || ""
        }));
        setTopBdogUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error loading top BDOG users:', error);
    }
  };

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
    <div className="relative min-h-screen bg-background px-2 py-4 overflow-y-auto">
      {/* Background coin */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 z-5">
        <img 
          src={customLogo} 
          alt="BDOG Coin" 
          className="w-80 h-80 object-contain"
        />
      </div>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border relative">
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
          <h1 className="text-lg font-semibold text-foreground animate-text-glow">Кошелёк</h1>
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
      <div className="px-4 pt-4 relative z-10">
        <div className="relative">
          <img 
            src={customLogo} 
            alt="BDOG" 
            className="w-20 h-20 mx-auto mb-2 object-contain"
          />
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground mb-1">BDOG Баланс</div>
            <div className="text-2xl font-bold text-gold">
              {formatBalance(parseFloat(walletData?.bdogBalance || "0"))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">BDOG Tokens</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20 relative z-10">
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
                    <h3 className="font-semibold text-foreground animate-text-bounce">Мой кошелёк</h3>
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
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                      <img src={customLogo} alt="TON" className="w-6 h-6 object-contain brightness-200" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground animate-text-bounce">TON</h4>
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
                      <img src={bdogLogo} alt="V-BDOG" className="w-6 h-6 object-cover rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground animate-text-bounce">V-BDOG</h4>
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
                  <h4 className="font-medium text-foreground animate-text-bounce">NFT Коллекция</h4>
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

          {/* History Tab Content */}
          <TabsContent value="history" className="px-4 pt-6">
            <Card className="card-tonkeeper p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground animate-text-bounce">История транзакций</h3>
              </div>
              
              <div className="text-center py-12">
                <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">Транзакций не обнаружено</h4>
                <p className="text-sm text-muted-foreground">
                  История всех транзакций BDOG будет отображаться здесь
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Collections Tab Content */}
          <TabsContent value="collections" className="px-4 pt-6">
            <Card className="card-tonkeeper p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground animate-text-bounce">NFT Коллекции</h3>
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

          {/* Top BDOG Users Tab Content */}
          <TabsContent value="top" className="px-4 pt-6">
            <Card className="card-tonkeeper p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="w-5 h-5 text-gold" />
                <h3 className="font-semibold text-foreground animate-text-bounce">Топ 20 BDOG</h3>
              </div>
              
              {topBdogUsers.length > 0 ? (
                <div className="space-y-2">
                  {topBdogUsers.map((user, index) => (
                    <div 
                      key={user.address + index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-gold/20 border border-gold/30' :
                        index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                        index === 2 ? 'bg-orange-600/20 border border-orange-600/30' :
                        'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          <span className="font-bold text-sm">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.address.slice(0, 8)}...{user.address.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold">
                          {user.balance.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">BDOG</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-foreground mb-2">Топ пользователей загружается</h4>
                  <p className="text-sm text-muted-foreground">
                    Здесь будут отображены топ-20 пользователей по балансу BDOG
                  </p>
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
            className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
              activeTab === "history" 
                ? "text-gold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">История</span>
          </button>
          
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
              activeTab === "wallet" 
                ? "text-gold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <WalletIcon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Кошелёк</span>
          </button>

          <button
            onClick={() => setActiveTab("top")}
            className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
              activeTab === "top" 
                ? "text-gold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Топ</span>
          </button>
          
          <button
            onClick={() => setActiveTab("collections")}
            className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
              activeTab === "collections" 
                ? "text-gold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">NFT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectedWallet;