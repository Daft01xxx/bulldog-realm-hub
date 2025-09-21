import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCw, Copy, ExternalLink, ShoppingCart, History, Wallet, Image as ImageIcon, Send } from 'lucide-react';
import { useBdogTonWallet } from '@/hooks/useTonWallet';
import { useToast } from '@/hooks/use-toast';

const ConnectedWallet = () => {
  const navigate = useNavigate();
  const { 
    isConnected, 
    walletData, 
    loading, 
    profile, 
    disconnectWallet, 
    refreshWalletData, 
    autoRefresh, 
    setAutoRefresh 
  } = useBdogTonWallet();
  const { toast } = useToast();

  // Redirect if not connected
  if (!isConnected) {
    navigate('/wallet');
    return null;
  }

  const copyAddress = () => {
    if (walletData?.walletInfo?.address) {
      navigator.clipboard.writeText(walletData.walletInfo.address);
      toast({
        title: "Адрес скопирован",
        description: "Адрес кошелька скопирован в буфер обмена",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600 to-yellow-500">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/menu')}
          className="text-black hover:bg-black/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-bold text-black">BDOG Wallet</h1>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshWalletData}
          disabled={loading}
          className="text-black hover:bg-black/10"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wallet" className="w-full">
        <div className="flex-1 pb-16">
          <TabsContent value="wallet" className="p-4 space-y-4 m-0">
            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-amber-600 to-yellow-500 text-black p-6 border-0">
              <div className="text-center">
                <div className="text-sm opacity-80 mb-2">Общий баланс</div>
                <div className="text-3xl font-bold mb-4">
                  {walletData?.tonBalance || '0'} TON
                </div>
                <div className="text-lg font-semibold">
                  {walletData?.bdogBalance || '0'} BDOG
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => window.open('https://t.me/blum/app?startapp=memepadjetton_BDOG_Y28d0-ref_wg9QjmgoJX', '_blank')}
                className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-black font-semibold py-6"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Купить BDOG
              </Button>
              
              <Button
                onClick={() => window.open('https://bdogpay.com', '_blank')}
                variant="outline"
                className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-black py-6"
              >
                <Send className="mr-2 h-5 w-5" />
                Отправить BDOG
              </Button>
            </div>

            {/* Wallet Info */}
            <Card className="bg-gray-900 border-gray-800 p-4">
              <h3 className="font-semibold mb-4 text-amber-500">Информация о кошельке</h3>
              
              {walletData?.walletInfo && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Адрес:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">
                        {walletData.walletInfo.shortAddress}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyAddress}
                        className="h-6 w-6 text-amber-500 hover:text-amber-600"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">NFT коллекция:</span>
                    <span className="text-white">{walletData.walletInfo.nftCount}</span>
                  </div>
                </div>
              )}
              
              <Button
                onClick={disconnectWallet}
                variant="destructive"
                className="w-full mt-4"
              >
                Отключить кошелёк
              </Button>
            </Card>

            {/* Balance Details */}
            <Card className="bg-gray-900 border-gray-800 p-4">
              <h3 className="font-semibold mb-4 text-amber-500">Детали баланса</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">TON:</span>
                  <span className="text-white font-mono">{walletData?.tonBalance || '0'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">V-BDOG:</span>
                  <span className="text-amber-500 font-mono">
                    {profile?.v_bdog_earned?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="p-4 m-0">
            <Card className="bg-gray-900 border-gray-800 p-6 text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold mb-2 text-white">История транзакций</h3>
              <p className="text-gray-400">Транзакций не обнаружено</p>
            </Card>
          </TabsContent>

          <TabsContent value="collections" className="p-4 m-0">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-amber-500">NFT Коллекции</h3>
              
              {walletData?.nfts && walletData.nfts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {walletData.nfts.map((nft, index) => (
                    <Card key={nft.id || index} className="bg-gray-900 border-gray-800 p-3">
                      {nft.image ? (
                        <img 
                          src={nft.image} 
                          alt={nft.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      
                      <h4 className="font-semibold text-sm text-white truncate">
                        {nft.name}
                      </h4>
                      
                      <p className="text-xs text-gray-400 truncate">
                        {nft.collection}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800 p-6 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 mb-4">NFT не найдены в вашем кошельке</p>
                  <Button
                    onClick={() => window.open('https://getgems.io/nft/EQC5Q1fGi0f1K9z7tfNaWRZcEzELxpW1B3bKCEgBkEV6ZW2G', '_blank')}
                    className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-black"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Купить NFT
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
          <TabsList className="grid w-full grid-cols-3 bg-transparent h-16 rounded-none">
            <TabsTrigger 
              value="history" 
              className="flex flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-amber-500 text-gray-400 h-full"
            >
              <History className="h-5 w-5" />
              <span className="text-xs">История</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="wallet" 
              className="flex flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-amber-500 text-gray-400 h-full"
            >
              <Wallet className="h-5 w-5" />
              <span className="text-xs">Кошелёк</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="collections" 
              className="flex flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-amber-500 text-gray-400 h-full"
            >
              <ImageIcon className="h-5 w-5" />
              <span className="text-xs">Коллекции</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default ConnectedWallet;