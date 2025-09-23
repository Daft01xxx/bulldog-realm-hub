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
    <div className="p-4 pb-24 space-y-6 relative">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-background">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 z-10 opacity-20">
          <img 
            src={bulldogCoin} 
            alt="BDOG Coin" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-800 mb-2">Магазин BDOG</h1>
        <div className="w-32 h-32 mx-auto mb-6">
          <img 
            src={bulldogCoin} 
            alt="BDOG Coin" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-amber-700 mb-4 text-center">
            🎉 Акция в честь открытия
          </h2>
          
          <div className="space-y-4">
            {/* Bones Package */}
            <Card className="p-4 bg-white/80 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16">
                    <img 
                      src={bulldogCoin} 
                      alt="Bones" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">x1000 косточек</p>
                    <p className="text-sm text-gray-600">
                      <span className="line-through text-red-500">2 TON</span> 
                      <span className="ml-2 text-green-600 font-semibold">1 TON (-50%)</span>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePurchase("1000000000", "bones", { bones: 1000 })}
                  disabled={loading === "bones"}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {loading === "bones" ? "Покупаем..." : "Купить"}
                </Button>
              </div>
            </Card>

            {/* V-BDOG Package */}
            <Card className="p-4 bg-white/80 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16">
                    <img 
                      src={bulldogSilverCoin} 
                      alt="V-BDOG" 
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">5,000,000 V-BDOG</p>
                    <p className="text-sm text-gray-600">
                      <span className="line-through text-red-500">10 TON</span> 
                      <span className="ml-2 text-green-600 font-semibold">5 TON (-50%)</span>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePurchase("5000000000", "vbdog", { vbdog: 5000000 })}
                  disabled={loading === "vbdog"}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {loading === "vbdog" ? "Покупаем..." : "Купить"}
                </Button>
              </div>
            </Card>

            {/* Booster Package */}
            <Card className="p-4 bg-white/80 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-yellow-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Ускоритель на 6 часов</p>
                    <p className="text-sm text-gray-600">
                      <span className="text-blue-600 font-semibold">3 TON</span>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handlePurchase("3000000000", "booster", { booster: 6 })}
                  disabled={loading === "booster"}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {loading === "booster" ? "Покупаем..." : "Купить"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Weekly Gift Section */}
        <div>
          <h2 className="text-xl font-semibold text-amber-700 mb-4 text-center">
            🎁 Еженедельный подарок
          </h2>
          <WeeklyGift />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;