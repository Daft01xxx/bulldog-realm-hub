import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import bulldogCoin from "@/assets/bulldog-coin.png";
import bulldogSilverCoin from "@/assets/bdog-silver-logo.jpeg";
import bulldogAlt1 from "@/assets/bulldog-alt-1.jpeg";
import bulldogAlt2 from "@/assets/bulldog-alt-2.jpeg";
import bulldogAlt3 from "@/assets/bulldog-alt-3.jpeg";

const WeeklyGift = () => {
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  const [showGiftPage, setShowGiftPage] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [canClaim, setCanClaim] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState<string | null>(null);

  useEffect(() => {
    const lastClaim = localStorage.getItem('last-daily-claim');
    setLastClaimTime(lastClaim);
    
    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      const now = new Date();
      const diff = now.getTime() - lastClaimDate.getTime();
      const hoursSinceClaim = diff / (1000 * 60 * 60);
      
      setCanClaim(hoursSinceClaim >= 24);
    } else {
      setCanClaim(true);
    }

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const updateTimer = () => {
    if (!lastClaimTime) {
      setTimeLeft("Можно забрать!");
      return;
    }

    const lastClaim = new Date(lastClaimTime);
    const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = nextClaim.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeLeft("Можно забрать!");
      setCanClaim(true);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft(`${days}д ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const openGift = () => {
    if (!canClaim) {
      toast({
        title: "Слишком рано!",
        description: "Подарок можно забрать раз в день",
        variant: "destructive",
      });
      return;
    }
    setShowGiftPage(true);
  };

  const clickGift = async () => {
    const lastClaim = localStorage.getItem('last-daily-claim');
    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      const now = new Date();
      const hoursSinceClaim = (now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceClaim < 24) {
        await supabase.from('profiles').update({
          ban: 1,
        } as any).eq('user_id', profile?.user_id);
        
        toast({
          title: "Нарушение правил",
          description: "Попытка забрать подарок дважды. Аккаунт заблокирован за 5.1.",
          variant: "destructive",
        });
        return;
      }
    }

    setShowFireworks(true);
    
    const rand = Math.random();
    let newReward;
    
    if (rand < 0.5) {
      newReward = {
        type: 'bones',
        amount: 100,
        icon: bulldogCoin,
        text: 'x100 косточек'
      };
    } else if (rand < 0.75) {
      newReward = {
        type: 'vbdog',
        amount: 10000,
        icon: bulldogSilverCoin,
        text: 'x10,000 V-BDOG'
      };
    } else {
      const logos = [bulldogAlt1, bulldogAlt2, bulldogAlt3];
      const availableLogos = localStorage.getItem('claimed-logos') ? 
        JSON.parse(localStorage.getItem('claimed-logos')!) : [];
      const unclaimed = logos.filter(logo => !availableLogos.includes(logo));
      
      if (unclaimed.length === 0) {
        // If all logos claimed, give coins instead
        newReward = {
          type: 'bones',
          amount: 100,
          icon: bulldogCoin,
          text: 'x100 косточек'
        };
      } else {
        const randomLogo = unclaimed[Math.floor(Math.random() * unclaimed.length)];
        newReward = {
          type: 'logo',
          logo: randomLogo,
          text: 'Новый логотип!'
        };
      }
    }
    
    setReward(newReward);
    setGiftOpened(true);
    
    setTimeout(() => {
      setShowFireworks(false);
    }, 2000);
  };

  const claimReward = async () => {
    if (!profile || !reward) return;

    try {
      const now = new Date().toISOString();
      const updates: any = {};

      if (reward.type === 'bones') {
        updates.bone = (profile.bone || 0) + reward.amount;
      } else if (reward.type === 'vbdog') {
        updates.v_bdog_earned = (profile.v_bdog_earned || 0) + reward.amount;
      } else if (reward.type === 'logo') {
        updates.current_logo = reward.logo;
        // Track claimed logos
        const claimedLogos = localStorage.getItem('claimed-logos') ? 
          JSON.parse(localStorage.getItem('claimed-logos')!) : [];
        claimedLogos.push(reward.logo);
        localStorage.setItem('claimed-logos', JSON.stringify(claimedLogos));
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', profile.user_id);

      if (error) throw error;

      if (updates.bone !== undefined || updates.v_bdog_earned !== undefined || updates.current_logo !== undefined) {
        updateProfile(updates);
      }
      
      localStorage.setItem('last-daily-claim', now);
      setLastClaimTime(now);
      
      toast({
        title: "Награда получена!",
        description: `Вы получили: ${reward.text}`,
      });

      setShowGiftPage(false);
      setGiftOpened(false);
      setReward(null);
      setCanClaim(false);
    } catch (error) {
      console.error('Claim error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забрать награду",
        variant: "destructive",
      });
    }
  };

  if (showGiftPage) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 max-w-sm w-full text-center relative overflow-hidden">
          {showFireworks && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }, (_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-yellow-400 animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1000}ms`,
                  }}
                />
              ))}
            </div>
          )}
          
          {!giftOpened ? (
            <>
              <div className="mb-6">
                <Gift 
                  size={80} 
                  className="mx-auto text-pink-500 animate-bounce cursor-pointer hover:scale-110 transition-transform"
                  onClick={clickGift}
                />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-4">Жми!</p>
            </>
          ) : reward ? (
            <>
              <div className="mb-6">
                {reward.type === 'logo' ? (
                  <img 
                    src={reward.logo} 
                    alt="New Logo" 
                    className="w-20 h-20 mx-auto rounded-full animate-bounce"
                  />
                ) : (
                  <img 
                    src={reward.icon} 
                    alt="Reward" 
                    className="w-20 h-20 mx-auto animate-bounce"
                  />
                )}
              </div>
              <p className="text-xl font-bold text-gray-800 mb-6">{reward.text}</p>
              <Button 
                onClick={claimReward}
                className="bg-green-500 hover:bg-green-600 text-white w-full"
              >
                {reward.type === 'logo' ? 'Применить' : 'Забрать'}
              </Button>
            </>
          ) : null}
          
          <Button 
            variant="ghost" 
            onClick={() => setShowGiftPage(false)}
            className="absolute top-2 right-2 text-gray-500"
          >
            ✕
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="text-center">
        <Gift 
          size={60} 
          className={`mx-auto mb-4 ${canClaim ? 'text-green-500 animate-pulse' : 'text-gray-400'}`}
        />
        
        <p className="text-sm text-gray-600 mb-2">
          {canClaim ? "Подарок готов!" : `До следующего подарка: ${timeLeft}`}
        </p>
        
        <Button 
          onClick={openGift}
          disabled={!canClaim}
          className={`w-full ${canClaim ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'} text-white`}
        >
          {canClaim ? "Открыть" : "Ожидание..."}
        </Button>
      </div>
    </Card>
  );
};

export default WeeklyGift;