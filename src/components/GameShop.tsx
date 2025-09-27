import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Coins, Wallet, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBdogTonWallet } from '@/hooks/useTonWallet';
import { useProfile } from '@/hooks/useProfile';

interface ShopItem {
  id: string;
  name: string;
  price: string;
  currency: 'TON';
  bones?: number;
  boosterHours?: number;
  vBdog?: number;
  icon: JSX.Element;
  description: string;
  type: 'bones' | 'booster' | 'vbdog';
}

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

  const BDOG_TO_TON_RATE = 200000; // 1 TON = 200,000 BDOG

  const shopItems: ShopItem[] = [
    {
      id: 'bones_1000',
      name: '1,000 Косточек',
      price: '0.1',
      currency: 'TON' as const,
      bones: 1000,
      icon: <Coins className="w-6 h-6 text-gold" />,
      description: 'Пачка косточек для кормления',
      type: 'bones' as const
    },
    {
      id: 'bones_5000',
      name: '5,000 Косточек',
      price: '0.5',
      currency: 'TON' as const,
      bones: 5000,
      icon: <Coins className="w-6 h-6 text-gold" />,
      description: 'Большая упаковка косточек',
      type: 'bones' as const
    },
    {
      id: 'bones_10000',
      name: '10,000 Косточек',
      price: '1.0',
      currency: 'TON' as const,
      bones: 10000,
      icon: <Coins className="w-6 h-6 text-gold" />,
      description: 'Мега упаковка косточек',
      type: 'bones' as const
    },
    {
      id: 'booster_1h',
      name: 'Ускоритель на 1 час',
      price: '1.0',
      currency: 'TON' as const,
      boosterHours: 1,
      icon: <Zap className="w-6 h-6 text-primary" />,
      description: 'Увеличивает grow1 в 5 раз на 1 час',
      type: 'booster' as const
    },
    {
      id: 'booster_2h',
      name: 'Ускоритель на 2 часа',
      price: '1.5',
      currency: 'TON' as const,
      boosterHours: 2,
      icon: <Zap className="w-6 h-6 text-primary" />,
      description: 'Увеличивает grow1 в 5 раз на 2 часа',
      type: 'booster' as const
    },
    {
      id: 'vbdog_500k',
      name: '500,000 V-BDOG',
      price: '3.0',
      currency: 'TON' as const,
      vBdog: 500000,
      icon: <Coins className="w-6 h-6 text-primary" />,
      description: 'Пачка V-BDOG токенов',
      type: 'vbdog' as const
    },
    {
      id: 'vbdog_1m',
      name: '1,000,000 V-BDOG',
      price: '5.0',
      currency: 'TON' as const,
      vBdog: 1000000,
      icon: <Coins className="w-6 h-6 text-primary" />,
      description: 'Миллион V-BDOG токенов',
      type: 'vbdog' as const
    },
    {
      id: 'vbdog_2m',
      name: '2,000,000 V-BDOG',
      price: '9.0',
      currency: 'TON' as const,
      vBdog: 2000000,
      icon: <Coins className="w-6 h-6 text-primary" />,
      description: '2 миллиона V-BDOG токенов',
      type: 'vbdog' as const
    },
    {
      id: 'vbdog_4m',
      name: '4,000,000 V-BDOG',
      price: '16.0',
      currency: 'TON' as const,
      vBdog: 4000000,
      icon: <Coins className="w-6 h-6 text-primary" />,
      description: '4 миллиона V-BDOG токенов',
      type: 'vbdog' as const
    },
    {
      id: 'vbdog_8m',
      name: '8,000,000 V-BDOG',
      price: '30.0',
      currency: 'TON' as const,
      vBdog: 8000000,
      icon: <Coins className="w-6 h-6 text-primary" />,
      description: '8 миллионов V-BDOG токенов',
      type: 'vbdog' as const
    }
  ];

  const handlePurchase = async (item: ShopItem) => {
    setIsProcessing(true);

    try {
      const requiredAmount = parseFloat(item.price);
      const networkFee = 0.1; // TON network fee
      const totalRequired = requiredAmount + networkFee;

      if (!isConnected) {
        toast({
          title: "Кошелек не подключен",
          description: "Подключите кошелек для покупки",
          variant: "destructive",
        });
        return;
      }

      const availableBalance = parseFloat(walletData?.tonBalance || "0");
      if (availableBalance < totalRequired) {
        toast({
          title: "Недостаточно TON",
          description: `Нужно ${totalRequired.toFixed(2)} TON (${item.price} + 0.1 комиссия), доступно ${availableBalance.toFixed(2)} TON`,
          variant: "destructive",
        });
        return;
      }

      // Send TON transaction
      const merchantWallet = "UQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7";
      let comment = "";
      if (item.type === 'bones') {
        comment = `BDOG: ${item.bones} косточек`;
      } else if (item.type === 'booster') {
        comment = `BDOG: ${item.name}`;
      } else if (item.type === 'vbdog') {
        comment = `BDOG: ${item.vBdog} V-BDOG`;
      }
      
      const result = await sendTransaction(merchantWallet, item.price, comment);
      
      if (!result) return;

      // Apply purchase effects
      if (item.type === 'bones') {
        const newBoneBalance = bone + (item.bones || 0);
        setBone(newBoneBalance);
        localStorage.setItem("bdog-bone", newBoneBalance.toString());
        
        await updateProfile({
          bone: newBoneBalance
        });

        toast({
          title: "Покупка успешна!",
          description: `Получено ${item.bones} косточек`,
        });
      } else if (item.type === 'booster') {
        const currentGrow1 = profile?.grow1 || 1;
        const boosterExpiry = new Date();
        boosterExpiry.setHours(boosterExpiry.getHours() + (item.boosterHours || 1));

        await updateProfile({
          grow1: currentGrow1 * 5, // 5x multiplier
          booster_expires_at: boosterExpiry.toISOString()
        });

        toast({
          title: "Ускоритель активирован!",
          description: `Grow1 увеличен в 5 раз на ${item.boosterHours} час(ов)`,
        });
      } else if (item.type === 'vbdog') {
        const currentVBdog = profile?.v_bdog_earned || 0;
        const newVBdog = currentVBdog + (item.vBdog || 0);

        await updateProfile({
          v_bdog_earned: newVBdog
        });

        toast({
          title: "Покупка успешна!",
          description: `Получено ${item.vBdog?.toLocaleString()} V-BDOG`,
        });
      }

    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Ошибка покупки",
        description: "Не удалось завершить покупку",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
            <h3 className="font-semibold text-gold">TON Баланс</h3>
            <p className="text-xl font-bold text-gradient">
              {walletData?.tonBalance || "0"} TON
            </p>
          </div>
          <Wallet className="w-6 h-6 text-gold" />
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
          Магазин
        </h3>
        
        {shopItems.map((item) => (
          <Card key={item.id} className="card-glow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-gold">
                      {item.price} TON
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => handlePurchase(item)}
                  className="button-gold text-xs px-4 py-2"
                  disabled={isProcessing || !isConnected || parseFloat(walletData?.tonBalance || "0") < (parseFloat(item.price) + 0.1)}
                >
                  {isProcessing ? "Покупка..." : "Купить"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="card-glow p-4 bg-gold/10 border-gold/20">
        <div className="text-sm text-muted-foreground text-center space-y-1">
          <p>💡 Косточки используются для кормления бульдога и получения роста</p>
          <p>⚡ Ускорители увеличивают grow1 в 5 раз на указанное время</p>
          <p>💰 V-BDOG токены для использования в экосистеме</p>
          <p>⚠️ Для транзакции нужно +0.1 TON на комиссию сети</p>
        </div>
      </Card>
    </div>
  );
}