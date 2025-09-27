import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Coins, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBdogTonWallet } from '@/hooks/useTonWallet';
import { useProfile } from '@/hooks/useProfile';

interface GameShopProps {
  bone: number;
  setBone: (bone: number) => void;
  profile: any;
}

export default function GameShop({ bone, setBone, profile }: GameShopProps) {
  const { toast } = useToast();
  const { updateProfile } = useProfile();
  const {
    isConnected,
    walletData,
    loading: walletLoading,
    connectWallet,
    sendTransaction
  } = useBdogTonWallet();

  const [isProcessing, setIsProcessing] = useState(false);

  const shopItems = [
    {
      id: 'bones_1000',
      name: '1,000 Косточек',
      price: '0.1',
      currency: 'TON',
      bones: 1000,
      icon: <Coins className="w-6 h-6 text-gold" />,
      description: 'Пачка косточек для кормления'
    },
    {
      id: 'bones_5000',
      name: '5,000 Косточек',
      price: '0.5',
      currency: 'TON',
      bones: 5000,
      icon: <Coins className="w-6 h-6 text-gold" />,
      description: 'Большая упаковка косточек'
    },
    {
      id: 'bones_10000',
      name: '10,000 Косточек',
      price: '1.0',
      currency: 'TON',
      bones: 10000,
      icon: <Coins className="w-6 h-6 text-gold" />,
      description: 'Мега упаковка косточек'
    }
  ];

  const handlePurchase = async (item: typeof shopItems[0]) => {
    console.log('[GameShop] Starting purchase:', item);
    
    if (!isConnected) {
      console.log('[GameShop] Wallet not connected');
      toast({
        title: "Кошелек не подключен",
        description: "Подключите кошелек для покупки",
        variant: "destructive",
      });
      return;
    }

    const availableBalance = parseFloat(walletData?.tonBalance || "0");
    const requiredAmount = parseFloat(item.price);
    
    console.log('[GameShop] Balance check:', { 
      available: availableBalance, 
      required: requiredAmount,
      hasEnough: availableBalance >= requiredAmount
    });

    // Check for minimum transaction amount (0.1 TON for fees)
    const minRequiredBalance = requiredAmount + 0.05; // Reduced min fee to 0.05 TON
    if (availableBalance < minRequiredBalance) {
      console.log('[GameShop] Insufficient balance including fees');
      toast({
        title: "Недостаточно TON",
        description: `Нужно ${minRequiredBalance.toFixed(2)} TON (включая комиссию ~0.05), доступно ${availableBalance.toFixed(2)} TON`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    console.log('[GameShop] Processing transaction...');

    try {
      // Send transaction to user's TON wallet
      const merchantWallet = "UQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7"; // User's TON wallet
      console.log('[GameShop] Sending to wallet:', merchantWallet);
      
      const result = await sendTransaction(
        merchantWallet,
        item.price,
        `BDOG: ${item.bones} косточек`
      );

      console.log('[GameShop] Transaction result:', result);

      if (result) {
        // Update bone balance
        const newBoneBalance = bone + item.bones;
        setBone(newBoneBalance);
        localStorage.setItem("bdog-bone", newBoneBalance.toString());
        
        // Update profile
        await updateProfile({
          bone: newBoneBalance
        });

        console.log('[GameShop] Purchase successful, updated bones:', newBoneBalance);
        toast({
          title: "Покупка успешна!",
          description: `Получено ${item.bones} косточек`,
        });
      } else {
        console.log('[GameShop] Transaction failed - no result');
      }
    } catch (error) {
      console.error('[GameShop] Purchase failed:', error);
      toast({
        title: "Ошибка покупки",
        description: `Не удалось завершить покупку: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      console.log('[GameShop] Purchase process completed');
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <Card className="card-glow p-6 text-center">
          <Wallet className="w-16 h-16 text-gold mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gradient mb-2">
            Подключите кошелек
          </h3>
          <p className="text-muted-foreground mb-4">
            Для покупки косточек за TON необходимо подключить кошелек
          </p>
          <Button 
            onClick={connectWallet}
            className="button-gold"
            disabled={walletLoading}
          >
            {walletLoading ? "Загрузка..." : "Подключить кошелек"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Info */}
      <Card className="card-glow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gold">Ваш баланс</h3>
            <p className="text-2xl font-bold text-gradient">
              {walletData?.tonBalance || "0"} TON
            </p>
          </div>
          <Wallet className="w-8 h-8 text-gold" />
        </div>
      </Card>

      {/* Current Bones */}
      <Card className="card-glow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Текущие косточки</h3>
            <p className="text-2xl font-bold text-gold">
              {bone.toLocaleString()}
            </p>
          </div>
          <Coins className="w-8 h-8 text-gold" />
        </div>
      </Card>

      {/* Shop Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground text-center mb-4 flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gold" />
          Магазин косточек
        </h3>
        
        {shopItems.map((item) => (
          <Card key={item.id} className="card-glow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gold">
                  {item.price} {item.currency}
                </div>
                <Button
                  onClick={() => handlePurchase(item)}
                  className="button-gold mt-2 text-sm px-3 py-1"
                  disabled={isProcessing || parseFloat(walletData?.tonBalance || "0") < parseFloat(item.price)}
                >
                  {isProcessing ? "Покупка..." : "Купить"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="card-glow p-4 bg-gold/10 border-gold/20">
        <p className="text-sm text-muted-foreground text-center">
          💡 Косточки используются для кормления бульдога и получения роста
        </p>
      </Card>

      {/* Debug Info Card */}
      <Card className="card-glow p-4 bg-blue-500/10 border-blue-500/20">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">🔧 Информация для отладки</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Минимум TON для транзакции: сумма покупки + 0.05 TON (комиссия)</p>
          <p>• Адрес получателя: {walletData?.address ? `${walletData.address.slice(0, 8)}...${walletData.address.slice(-8)}` : 'не определен'}</p>
          <p>• Формат адреса: {walletData?.address?.startsWith('UQ') ? 'Non-bounceable (правильный для кошелька)' : walletData?.address?.startsWith('EQ') ? 'Bounceable' : 'неизвестный'}</p>
          <p>• Для детальной отладки откройте консоль разработчика (F12)</p>
        </div>
      </Card>
    </div>
  );
}