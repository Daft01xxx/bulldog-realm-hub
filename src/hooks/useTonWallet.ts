import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress, useIsConnectionRestored } from '@tonconnect/ui-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

  interface WalletData {
    address: string;
    tonBalance: string;
    bdogBalance: string;
    bdogJettonWallet?: string;
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
      transactionHistory?: Array<{
        type: 'in' | 'out';
        amount: string;
        currency: string;
        timestamp: string;
        fee?: string;
      }>;
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

  const calculateTransactionFee = (amount: string, currency: 'ton' | 'bdog' = 'ton') => {
    return 0.1; // Fixed fee of 0.1 TON for all transfers
  };

  const sendTransaction = async (to: string, amount: string, comment?: string, currency: 'ton' | 'bdog' = 'ton') => {
    if (!wallet?.account) {
      toast({
        title: "Ошибка",
        description: "Кошелек не подключен",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('Sending transaction:', { to, amount, comment, currency });
      
      const sendAmount = parseFloat(amount);
      const feeAmount = calculateTransactionFee(amount, currency);
      const availableBalance = parseFloat(walletData?.tonBalance || "0");
      
      // Check if we have enough TON for amount + fee
      const totalRequired = currency === 'ton' ? sendAmount + feeAmount : feeAmount;
      
      if (availableBalance < totalRequired) {
        toast({
          title: "Недостаточно TON",
          description: `Нужно ${totalRequired.toFixed(2)} TON (включая комиссию ${feeAmount} TON)`,
          variant: "destructive",
        });
        return null;
      }
      
      // Prepare transaction payload
      let payload = undefined;
      if (comment) {
        // Create text comment payload according to TON standards
        // For text comments, we need to use "te6/3" format
        const commentBytes = new TextEncoder().encode(comment);
        const commentBuffer = new Uint8Array(4 + commentBytes.length);
        commentBuffer.set([0, 0, 0, 0], 0); // Text comment prefix (32 zero bits)
        commentBuffer.set(commentBytes, 4);
        
        // Convert to hex string for TON Connect
        const hexString = Array.from(commentBuffer)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');
        payload = hexString;
      }

      // Prepare transaction with fee
      const messages = [];
      
      // Main transaction
      if (currency === 'ton') {
        messages.push({
          address: to,
          amount: (sendAmount * 1000000000).toString()
        });
      } else {
        // BDOG transfers are not yet implemented - need jetton contract integration
        throw new Error('Отправка BDOG токенов временно недоступна. Используйте TON.');
      }
      
      // Fee transaction (always in TON)
      if (feeAmount > 0) {
        const feeAddress = "UQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7"; // Fee collection address
        messages.push({
          address: feeAddress,
          amount: (feeAmount * 1000000000).toString(),
        });
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // Valid for 10 minutes
        messages
      };

      console.log('Transaction object:', transaction);
      
      const result = await tonConnectUI.sendTransaction(transaction);
      
      console.log('Transaction result:', result);
      
      toast({
        title: "Транзакция отправлена",
        description: `Транзакция на ${amount} ${currency.toUpperCase()} отправлена (комиссия: ${feeAmount} TON)`,
      });

      // Refresh wallet data after transaction
      setTimeout(() => {
        if (wallet?.account?.address) {
          fetchWalletData(wallet.account.address);
        }
      }, 3000);

      return result;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      let errorMessage = "Не удалось отправить транзакцию";
      
      if (error.message?.includes('user rejected') || error.message?.includes('cancelled')) {
        errorMessage = "Транзакция отклонена пользователем";
      } else if (error.message?.includes('insufficient balance') || error.message?.includes('not enough')) {
        errorMessage = "Недостаточно средств на балансе";
      } else if (error.message?.includes('invalid address')) {
        errorMessage = "Неверный адрес получателя";
      } else if (error.message?.includes('network')) {
        errorMessage = "Ошибка сети. Попробуйте позже";
      }
      
      toast({
        title: "Ошибка транзакции",
        description: `${errorMessage}: ${error.message || 'Неизвестная ошибка'}`,
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
    calculateTransactionFee,
  };
};