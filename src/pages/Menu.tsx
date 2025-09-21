import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Info, Users, Megaphone, Gift } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { toast } from "@/hooks/use-toast";
import FallingCoins3D from "@/components/FallingCoin3D";
import bdogBackground from "@/assets/bdog-background.png";
import bdogSilverLogo from "@/assets/bdog-silver-logo.jpeg";

const Menu = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { isConnected, walletData } = useBdogTonWallet();
  const [reg, setReg] = useState("");
  const [bdogBalance, setBdogBalance] = useState("0");
  const [vBdogBalance, setVBdogBalance] = useState("0");
  const [animate, setAnimate] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);

  useEffect(() => {
    // Load user data from profile or localStorage
    if (profile) {
      setReg(profile.reg || "");
      // BDOG token balance from wallet (if connected) or profile
      const walletBdogBalance = isConnected ? parseFloat(walletData?.bdogBalance || '0') : 0;
      const profileBdogBalance = profile.bdog_balance || 0;
      setBdogBalance(Math.max(walletBdogBalance, profileBdogBalance).toString());
      // V-BDOG balance (internal game balance + referral rewards)
      const totalVBdog = (profile.balance2 || 0) + (profile.v_bdog_earned || 0);
      setVBdogBalance(totalVBdog.toString());
    } else {
      setReg(localStorage.getItem("bdog-reg") || "");
      setBdogBalance("0");
      const localBalance2 = localStorage.getItem("bdog-balance2") || "0";
      setVBdogBalance(localBalance2);
    }
    
    // Check if daily gift can be claimed
    const lastDailyGift = localStorage.getItem("bdog-last-daily-gift");
    const today = new Date().toDateString();
    setCanClaimDaily(!lastDailyGift || lastDailyGift !== today);
    
    // Trigger animations
    setAnimate(true);
  }, [profile, isConnected, walletData]);

  const claimDailyGift = async () => {
    if (!canClaimDaily) {
      toast({
        title: "Ежедневный подарок",
        description: "Подарок уже получен сегодня! Попробуйте завтра.",
        variant: "destructive",
      });
      return;
    }

    // Random reward logic
    const random = Math.floor(Math.random() * 100) + 1;
    let reward = "";
    let updateData: any = {};

    if (random <= 10) {
      // 10% chance for 10,000 V-BDOG
      reward = "10,000 V-BDOG";
      updateData.balance2 = (profile?.balance2 || 0) + 10000;
    } else if (random <= 15) {
      // 5% chance for 20,000 V-BDOG
      reward = "20,000 V-BDOG";
      updateData.balance2 = (profile?.balance2 || 0) + 20000;
    } else if (random <= 65) {
      // 50% chance for 100 bones
      reward = "100 косточек";
      updateData.bone = (profile?.bone || 1000) + 100;
    } else {
      // 35% chance for growth +100
      reward = "Рост +100";
      updateData.grow = (profile?.grow || 0) + 100;
    }

    try {
      if (profile) {
        await updateProfile(updateData);
      } else {
        // Update localStorage if no profile
        if (updateData.balance2) {
          localStorage.setItem("bdog-balance2", updateData.balance2.toString());
        }
      }

      // Mark daily gift as claimed
      localStorage.setItem("bdog-last-daily-gift", new Date().toDateString());
      setCanClaimDaily(false);

      toast({
        title: "Ежедневный подарок получен! 🎉",
        description: `Поздравляем! Вы получили: ${reward}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить ежедневный подарок. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    {
      title: "Кошелёк BDOG",
      icon: Wallet,
      path: "/wallet",
      description: "Управляйте своими токенами",
      delay: "0.1s"
    },
    {
      title: "BDOG GAME",
      icon: "bdog-silver",
      path: "/game",
      description: "Играйте и зарабатывайте",
      delay: "0.2s"
    },
    {
      title: "Информация о BDOG",
      icon: Info,
      path: "/info",
      description: "Узнайте больше о проекте",
      delay: "0.3s"
    },
    {
      title: "Реферальная программа",
      icon: Users,
      path: "/referral",
      description: "Приглашайте друзей",
      delay: "0.4s"
    },
    {
      title: "Реклама проекта за вознаграждение",
      icon: Megaphone,
      path: "/promotion",
      description: "Продвигайте и получайте награды",
      delay: "0.5s"
    }
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden">
      {/* 3D Falling Coins */}
      <FallingCoins3D count={15} />
      

      {/* Header with title */}
      <div className="text-center mb-12 pt-8 relative z-10">
        <h1 
          className={`text-5xl md:text-7xl font-bold text-gradient animate-glow-text mb-8 ${
            animate ? 'animate-bounce-in' : 'opacity-0'
          }`}
        >
          BDOG APP
        </h1>
        
        {/* User info */}
        <Card 
          className={`card-glow max-w-md mx-auto p-6 mb-8 ${
            animate ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          <div className="space-y-3">
            <p className="text-lg text-muted-foreground">
              <span className="text-gold font-semibold">{reg}</span>
            </p>
            <div className="space-y-2">
              <p className="text-xl text-foreground">
                BDOG токены: <span className="text-gradient font-bold">{bdogBalance}</span>
              </p>
              <p className="text-xl text-foreground">
                V-BDOG баланс: <span className="text-gradient font-bold">{vBdogBalance}</span>
              </p>
              {profile?.v_bdog_earned && profile.v_bdog_earned > 0 && (
                <p className="text-sm text-gold">
                  (включая {profile.v_bdog_earned.toLocaleString()} V-BDOG за рефералов)
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Daily Gift Button */}
        <div className="text-center mb-8">
          <Button
            onClick={claimDailyGift}
            disabled={!canClaimDaily}
            className={`button-gradient-gold px-8 py-3 text-lg font-semibold ${
              animate ? 'animate-bounce-in' : 'opacity-0'
            } ${!canClaimDaily ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}`}
            style={{ animationDelay: '0.5s' }}
          >
            <Gift className="w-5 h-5 mr-2" />
            {canClaimDaily ? "Получить ежедневный подарок" : "Подарок уже получен"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 opacity-70">
            Обновляется каждые 24 часа
          </p>
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon !== "bdog-silver" ? item.icon : null;
            return (
              <Card
                key={item.title}
                className={`card-glow p-6 cursor-pointer hover-lift group ${
                  animate ? 'animate-slide-in-right' : 'opacity-0'
                }`}
                style={{ animationDelay: item.delay }}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gradient-gold group-hover:animate-pulse-gold transition-all duration-300">
                    {item.icon === "bdog-silver" ? (
                      <img src={bdogSilverLogo} alt="BDOG Silver" className="w-8 h-8 rounded-full object-contain" />
                    ) : (
                      <IconComponent className="w-8 h-8 text-gold" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Advertising space */}
        <Card 
          className={`card-glow p-6 text-center relative z-10 ${
            animate ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.6s' }}
        >
          <p className="text-gray-subtle mb-2">Твоя реклама тут,</p>
          <a 
            href="https://t.me/Deff0xq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light transition-colors underline font-semibold"
          >
            пиши нам
          </a>
        </Card>
      </div>
    </div>
  );
};

export default Menu;