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
    console.log('Wallet state changed:', { 
      address: wallet?.account?.address, 
      connectionRestored,
      isConnected: !!wallet?.account 
    });
    
    if (wallet?.account?.address && connectionRestored) {
      console.log('Fetching wallet data for:', wallet.account.address);
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
      
      // Save wallet balance to profile (only wallet-related data, don't override game data)
      const bdogBalance = parseFloat(walletInfo.bdogBalance);
      const tonBalance = parseFloat(walletInfo.tonBalance);
      
      if (profile) {
        // Only update wallet-related fields, preserve game data (grow, bone, grow1)
        await updateProfile({
          balance: Math.round(tonBalance * 1000000000), // Convert to nanotons for storage
          bdog_balance: bdogBalance, // BDOG tokens from blockchain
          wallet_address: address
          // Deliberately NOT updating grow, bone, grow1 to avoid conflicts with game
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

  const sendTransaction = async (to: string, amount: string, comment?: string) => {
    console.log('[TON Wallet] Starting transaction:', { to, amount, comment });
    
    if (!wallet?.account) {
      console.log('[TON Wallet] No wallet account available');
      toast({
        title: "Ошибка",
        description: "Кошелек не подключен",
        variant: "destructive",
      });
      return null;
    }

    console.log('[TON Wallet] Wallet account:', wallet.account.address);

    try {
      // Convert amount to nanotons (1 TON = 1,000,000,000 nanotons)
      const nanoAmount = (parseFloat(amount) * 1000000000).toString();
      console.log('[TON Wallet] Converting amount:', { original: amount, nano: nanoAmount });

      // Basic transaction without payload for now (comment support can be added later)
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // Valid for 6 minutes
        messages: [
          {
            address: to,
            amount: nanoAmount
            // Removed payload for now to simplify debugging
          }
        ]
      };

      console.log('[TON Wallet] Prepared transaction:', transaction);

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('[TON Wallet] TonConnect result:', result);
      
      // Add transaction tracking
      if (result && result.boc) {
        console.log('[TON Wallet] Transaction BOC (for tracking):', result.boc);
        
        toast({
          title: "Транзакция отправлена",
          description: `Транзакция на ${amount} TON отправлена${comment ? ` с комментарием: ${comment}` : ''}`,
        });
        
        // Try to extract transaction hash if possible
        try {
          // This is a simplified approach to get some transaction info
          console.log('[TON Wallet] Full transaction result:', JSON.stringify(result, null, 2));
        } catch (e) {
          console.log('[TON Wallet] Could not stringify result');
        }
      } else {
        console.log('[TON Wallet] No BOC in result, transaction might have failed');
        toast({
          title: "Внимание",
          description: "Транзакция отправлена, но не получен результат. Проверьте кошелек.",
          variant: "destructive",
        });
      }

      // Refresh wallet data after transaction
      setTimeout(() => {
        console.log('[TON Wallet] Refreshing wallet data after transaction');
        if (wallet?.account?.address) {
          fetchWalletData(wallet.account.address);
        }
      }, 5000); // Increased timeout

      return result;
    } catch (error: any) {
      console.error('[TON Wallet] Transaction failed with error:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorName: error.name,
        errorType: typeof error,
        fullError: JSON.stringify(error, null, 2)
      });
      
      let errorMessage = "Не удалось отправить транзакцию";
      
      // More comprehensive error handling
      if (error.message?.toLowerCase().includes('user rejected') || 
          error.message?.toLowerCase().includes('user declined') ||
          error.message?.toLowerCase().includes('cancelled')) {
        errorMessage = "Транзакция отклонена пользователем";
      } else if (error.message?.toLowerCase().includes('insufficient') || 
                 error.message?.toLowerCase().includes('not enough') ||
                 error.message?.toLowerCase().includes('balance')) {
        errorMessage = "Недостаточно средств на балансе";
      } else if (error.message?.toLowerCase().includes('invalid address')) {
        errorMessage = "Неверный адрес получателя";
      } else if (error.message?.toLowerCase().includes('network') || 
                 error.message?.toLowerCase().includes('connection')) {
        errorMessage = "Проблемы с сетевым подключением";
      } else if (error.message) {
        errorMessage = `Ошибка: ${error.message}`;
      }
      
      toast({
        title: "Ошибка транзакции",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    }
  };

  // Always return the same object structure
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
    sendTransaction,
  };
};