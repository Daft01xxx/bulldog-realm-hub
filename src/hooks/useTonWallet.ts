import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WalletData {
  address: string;
  tonBalance: string;
  bdogBalance: string;
  nfts: NFT[];
  lastUpdated: string;
}

interface NFT {
  id: string;
  name: string;
  image: string | null;
  collection: string;
}

export const useBdogTonWallet = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { toast } = useToast();
  
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fetch wallet data when wallet connects
  useEffect(() => {
    if (wallet?.account?.address) {
      fetchWalletData(wallet.account.address);
    } else {
      setWalletData(null);
    }
  }, [wallet?.account?.address]);

  const connectWallet = async () => {
    try {
      await tonConnectUI.connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключить кошелек",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
      setWalletData(null);
      toast({
        title: "Кошелек отключен",
        description: "Кошелек успешно отключен",
      });
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  const fetchWalletData = async (address: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tonviewer-api', {
        body: { walletAddress: address }
      });

      if (error) {
        console.error('Error fetching wallet data:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось получить данные кошелька",
          variant: "destructive",
        });
        return;
      }

      const walletInfo: WalletData = {
        address,
        tonBalance: data.tonBalance || "0",
        bdogBalance: data.bdogBalance || "0",
        nfts: data.nftData || [],
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };

      setWalletData(walletInfo);
      
      toast({
        title: "Данные обновлены",
        description: `Баланс BDOG: ${walletInfo.bdogBalance}`,
      });

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить данные кошелька",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = () => {
    if (wallet?.account?.address) {
      fetchWalletData(wallet.account.address);
    }
  };

  return {
    // Wallet connection state
    isConnected: !!wallet?.account,
    walletAddress: wallet?.account?.address,
    
    // Wallet data
    walletData,
    loading,
    
    // Actions
    connectWallet,
    disconnectWallet,
    refreshWalletData,
  };
};