import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import bulldogCoin from "@/assets/bulldog-coin.png";
import bulldogSilverCoin from "@/assets/bdog-silver-logo.jpeg";
import WeeklyGift from "./WeeklyGift";

const Shop = () => {
  const { toast } = useToast();
  const { isConnected, walletAddress } = useBdogTonWallet();
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState<string | null>(null);

  const recipientAddress = "UQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7";

  const handlePurchase = async (amount: string, item: string, reward: any) => {
    if (!isConnected || !walletAddress) {
      toast({
        title: "Ошибка",
        description: "Подключите кошелек для покупки",
        variant: "destructive",
      });
      return;
    }

    setLoading(item);
    
    try {
      // Simulate payment verification
      const paymentSuccessful = confirm(`Подтвердите оплату ${amount} TON за ${item}?`);
      
      if (!paymentSuccessful) {
        // User cancelled payment - ban them for trying to get free items
        await supabase.from('profiles').update({
          ban: 1,
        }).eq('user_id', profile?.user_id);
        
        toast({
          title: "Нарушение правил",
          description: "Попытка получить товар без оплаты. Аккаунт заблокирован.",
          variant: "destructive",
        });
        return;
      }

      // Add reward to user
      if (profile) {
        const updates: any = {};
        
        if (item === "bones") {
          updates.bone = (profile.bone || 0) + 1000;
        } else if (item === "vbdog") {
          updates.v_bdog_earned = (profile.v_bdog_earned || 0) + 5000000;
        } else if (item === "booster") {
          updates.grow1 = 2;
          updates.booster_expires_at = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
        }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', profile.user_id);

        if (error) throw error;

        updateProfile(updates);
        
        toast({
          title: "Покупка успешна!",
          description: `Вы получили: ${item === "bones" ? "1000 косточек" : item === "vbdog" ? "5,000,000 V-BDOG" : "Ускоритель на 6 часов"}`,
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Ошибка покупки",
        description: "Не удалось совершить покупку",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-2 pb-24 space-y-4 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gold mb-2">Магазин BDOG</h1>
        <div className="w-24 h-24 mx-auto mb-4">
          <img 
            src={bulldogCoin} 
            alt="BDOG Coin" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gold mb-4 text-center">
            🎉 Акция в честь открытия
          </h2>
          
          <div className="space-y-3">
            {/* Bones Package */}
            <Card className="card-glow p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12">
                    <img 
                      src={bulldogCoin} 
                      alt="Bones" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">x1000 косточек</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="line-through text-destructive">2 TON</span> 
                      <span className="ml-2 text-gold font-semibold">1 TON (-50%)</span>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePurchase("1000000000", "bones", { bones: 1000 })}
                  disabled={loading === "bones"}
                  className="button-outline-gold text-xs px-2 py-1"
                  size="sm"
                >
                  {loading === "bones" ? "Покупаем..." : "Купить"}
                </Button>
              </div>
            </Card>

            {/* V-BDOG Package */}
            <Card className="card-glow p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12">
                    <img 
                      src={bulldogSilverCoin} 
                      alt="V-BDOG" 
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">5,000,000 V-BDOG</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="line-through text-destructive">10 TON</span> 
                      <span className="ml-2 text-gold font-semibold">5 TON (-50%)</span>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePurchase("5000000000", "vbdog", { vbdog: 5000000 })}
                  disabled={loading === "vbdog"}
                  className="button-outline-gold text-xs px-2 py-1"
                  size="sm"
                >
                  {loading === "vbdog" ? "Покупаем..." : "Купить"}
                </Button>
              </div>
            </Card>

            {/* Booster Package */}
            <Card className="card-glow p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-gold animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Ускоритель на 6 часов</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-gold font-semibold">3 TON</span>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePurchase("3000000000", "booster", { booster: 6 })}
                  disabled={loading === "booster"}
                  className="button-outline-gold text-xs px-2 py-1"
                  size="sm"
                >
                  {loading === "booster" ? "Покупаем..." : "Купить"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Daily Gift Section */}
        <div>
          <h2 className="text-lg font-semibold text-gold mb-4 text-center">
            🎁 Ежедневный подарок
          </h2>
          <WeeklyGift />
        </div>
      </div>
    </div>
  );
};

export default Shop;