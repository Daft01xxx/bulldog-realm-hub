import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
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
  const { toast } = useToast();
  const { profile, updateProfile, fetchWalletBalance } = useProfile();
  
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-fetch wallet data when wallet connects
  useEffect(() => {
    if (wallet?.account?.address) {
      fetchWalletData(wallet.account.address);
    } else {
      setWalletData(null);
    }
  }, [wallet?.account?.address]);

  // Auto-refresh wallet data every 30 seconds when connected
  useEffect(() => {
    if (!wallet?.account?.address || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchWalletData(wallet.account.address);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [wallet?.account?.address, autoRefresh]);

  const connectWallet = async () => {
    try {
      console.log('=== WALLET CONNECTION START ===');
      console.log('TonConnect UI state:', tonConnectUI);
      console.log('Current wallet state:', wallet);
      console.log('Manifest URL:', 'https://746a55f0-1982-4167-ae0e-5312b0711d07.lovableproject.com/tonconnect-manifest.json');
      
      // Test manifest accessibility
      try {
        const manifestResponse = await fetch('/tonconnect-manifest.json');
        console.log('Manifest fetch response:', manifestResponse.status, manifestResponse.statusText);
        if (manifestResponse.ok) {
          const manifestData = await manifestResponse.json();
          console.log('Manifest data:', manifestData);
        } else {
          console.error('Manifest not accessible:', manifestResponse.status);
        }
      } catch (manifestError) {
        console.error('Error fetching manifest:', manifestError);
      }
      
      console.log('Calling tonConnectUI.connectWallet()...');
      await tonConnectUI.connectWallet();
      console.log('Wallet connection successful');
      
      toast({
        title: "Кошелек подключен",
        description: "Кошелек успешно подключен к приложению",
      });
    } catch (error) {
      console.error('=== WALLET CONNECTION ERROR ===');
      console.error('Wallet connection failed:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      console.log('Error name:', error?.name);
      console.log('Error message:', error?.message);
      console.log('Error stack:', error?.stack);
      
      toast({
        title: "Ошибка подключения",
        description: `Не удалось подключить кошелек: ${error?.message || 'Неизвестная ошибка'}`,
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
      
      toast({
        title: "Данные обновлены",
        description: `Баланс: ${tonBalance} TON, ${bdogBalance} BDOG`,
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