import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress, useIsConnectionRestored } from '@tonconnect/ui-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface WalletData {
  address: string;
  tonBalance: string;
  bdogBalance: string;
  nfts: NFT[];
  lastUpdated: string;
  walletInfo?: {
    address: string;
    shortAddress: string;
    tonBalance: string;
    bdogBalance: string;
    nftCount: number;
    lastSync: string;
    isActive: boolean;
  };
}

interface NFT {
  id: string;
  name: string;
  image: string | null;
  collection: string;
  description?: string | null;
  verified?: boolean;
}

export const useBdogTonWallet = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false);
  const connectionRestored = useIsConnectionRestored();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-fetch wallet data when wallet connects
  useEffect(() => {
    if (wallet?.account?.address && connectionRestored) {
      fetchWalletData(wallet.account.address);
    } else if (!wallet && connectionRestored) {
      setWalletData(null);
    }
  }, [wallet?.account?.address, connectionRestored]);

  // Auto-refresh wallet data every 30 seconds when connected
  useEffect(() => {
    if (!wallet?.account?.address || !autoRefresh) return;

    const interval = setInterval(() => {
      if (wallet?.account?.address) {
        fetchWalletData(wallet.account.address);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [wallet?.account?.address, autoRefresh]);

  const connectWallet = async () => {
    try {
      console.log('Opening wallet modal...');
      await tonConnectUI.openModal();
      
      toast({
        title: "Подключение кошелька",
        description: "Выберите кошелек для подключения",
      });
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
      
      toast({
        title: "Ошибка подключения",
        description: `Не удалось открыть диалог подключения кошелька`,
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
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        walletInfo: data.walletInfo || null
      };

      setWalletData(walletInfo);
      
      // Save wallet balance to profile
      const bdogBalance = parseFloat(walletInfo.bdogBalance);
      const tonBalance = parseFloat(walletInfo.tonBalance);
      
      if (profile) {
        await updateProfile({
          balance: Math.round(tonBalance * 1000000000), // Convert to nanotons for storage
          balance2: Math.round(bdogBalance),
          wallet_address: address
        });
      }

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

  // Return null if connection is not restored yet
  if (!connectionRestored) {
    return {
      isConnected: false,
      walletAddress: null,
      walletData: null,
      loading: false,
      autoRefresh: true,
      profile: null,
      connectWallet: () => Promise.resolve(),
      disconnectWallet: () => Promise.resolve(),
      refreshWalletData: () => {},
      setAutoRefresh: () => {},
      connectionRestored: false,
    };
  }

  return {
    // Connection state
    isConnected: !!wallet?.account,
    walletAddress: userFriendlyAddress || rawAddress || wallet?.account?.address,
    connectionRestored,
    
    // Wallet data
    walletData,
    loading,
    autoRefresh,
    
    // Profile data
    profile,
    
    // Actions
    connectWallet,
    disconnectWallet,
    refreshWalletData,
    setAutoRefresh,
  };
};