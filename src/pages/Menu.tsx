import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Info, Users, Megaphone, Gift, Headphones } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { toast } from "@/hooks/use-toast";
import { playButtonSound } from "@/utils/sounds";
import { scrollToTopInstant } from "@/utils/scrollToTop";

import bdogBackground from "@/assets/bdog-background.png";
import bdogLogo from "@/assets/bdog-logo.jpeg";
import bulldogCoinLarge from "@/assets/bulldog-coin-large.jpeg";

const Menu = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { isConnected, walletData } = useBdogTonWallet();
  const [reg, setReg] = useState("");
  const [bdogBalance, setBdogBalance] = useState("0");
  const [vBdogBalance, setVBdogBalance] = useState("0");
  const [animate, setAnimate] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [timeUntilNextGift, setTimeUntilNextGift] = useState("");

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
    
    // Check if daily gift can be claimed and calculate time remaining
    const lastDailyGift = localStorage.getItem("bdog-last-daily-gift");
    if (lastDailyGift) {
      const lastGiftTime = new Date(lastDailyGift).getTime();
      const nextGiftTime = lastGiftTime + (24 * 60 * 60 * 1000); // 24 hours later
      const now = Date.now();
      
      if (now < nextGiftTime) {
        // Still within cooldown period
        setCanClaimDaily(false);
        const timeRemaining = nextGiftTime - now;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilNextGift(`${hours}ч ${minutes}м`);
      } else {
        // Cooldown expired, can claim again
        setCanClaimDaily(true);
        setTimeUntilNextGift("");
      }
    } else {
      // No previous gift, can claim
      setCanClaimDaily(true);
      setTimeUntilNextGift("");
    }
    
    // Trigger animations
    setAnimate(true);
  }, [profile, isConnected, walletData]);
  
  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const lastDailyGift = localStorage.getItem("bdog-last-daily-gift");
      if (lastDailyGift) {
        const lastGiftTime = new Date(lastDailyGift).getTime();
        const nextGiftTime = lastGiftTime + (24 * 60 * 60 * 1000);
        const now = Date.now();
        
        if (now < nextGiftTime) {
          const timeRemaining = nextGiftTime - now;
          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilNextGift(`${hours}ч ${minutes}м`);
          setCanClaimDaily(false);
        } else {
          setTimeUntilNextGift("");
          setCanClaimDaily(true);
        }
      } else {
        setCanClaimDaily(true);
        setTimeUntilNextGift("");
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

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
      updateData.bone = (profile?.bone ?? 0) + 100;
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

      // Mark daily gift as claimed with current timestamp
      const currentTime = new Date();
      localStorage.setItem("bdog-last-daily-gift", currentTime.toISOString());
      setCanClaimDaily(false);

      // Calculate time until next gift (24 hours from now)
      const nextGiftTime = currentTime.getTime() + (24 * 60 * 60 * 1000);
      const timeRemaining = nextGiftTime - Date.now();
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilNextGift(`${hours}ч ${minutes}м`);

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
      path: isConnected ? "/connected-wallet" : "/wallet",
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
      title: "Техническая поддержка",
      icon: Headphones,
      path: "https://t.me/Deff0xq",
      description: "Помощь и поддержка",
      delay: "0.5s",
      external: true
    },
    {
      title: "Реклама проекта за вознаграждение",
      icon: Megaphone,
      path: "/promotion",
      description: "Продвигайте и получайте награды",
      delay: "0.6s"
    }
  ];

  return (
    <div className="min-h-screen bg-background px-2 py-4 relative overflow-hidden">
      
      
      {/* Header with title */}
      <div className="text-center mb-6 pt-4 relative z-10">
        <h1 
          className={`text-3xl md:text-4xl font-bold text-gradient animate-glow-text animate-pulse mb-4 ${
            animate ? 'animate-bounce-in' : 'opacity-0'
          }`}
        >
          BDOG APP
        </h1>
        
        {/* User info */}
        <Card 
          className={`card-glow max-w-md mx-auto p-8 mb-4 ${
            animate ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground text-center animate-pulse">
              ID: <span className="text-gold font-semibold text-xl">{reg}</span>
            </p>
            <div className="space-y-3">
            <p className="text-lg text-foreground text-center animate-text-glow">
                BDOG: <span className="text-gradient font-bold text-2xl">{bdogBalance}</span>
              </p>
              <p className="text-lg text-foreground text-center animate-text-glow">
                V-BDOG: <span className="text-gradient font-bold text-2xl">{vBdogBalance}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Daily Gift Button */}
        <div className="text-center mb-4">
          <Button
            onClick={() => {
              playButtonSound();
              claimDailyGift();
            }}
            disabled={!canClaimDaily}
            className={`button-gradient-gold button-glow px-4 py-2 text-sm font-semibold ${
              animate ? 'animate-bounce-in' : 'opacity-0'
            } ${!canClaimDaily ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}`}
            style={{ animationDelay: '0.5s' }}
          >
            <Gift className="w-3 h-3 mr-2 icon-gold" />
            {canClaimDaily ? "Получить ежедневный подарок" : `Следующий подарок через ${timeUntilNextGift}`}
          </Button>
          <p className="text-xs text-muted-foreground mt-1 opacity-70">
            {canClaimDaily ? "Получи свой ежедневный бонус!" : "Подарок обновляется каждые 24 часа"}
          </p>
        </div>

      </div>

      {/* Menu grid */}
      <div className="max-w-md mx-auto relative z-10">
        <div className="grid grid-cols-1 gap-2 mb-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon !== "bdog-silver" ? item.icon : null;
            const handleClick = () => {
              playButtonSound();
              scrollToTopInstant();
              if (item.external) {
                window.open(item.path, '_blank');
              } else {
                navigate(item.path);
              }
            };
            
            return (
              <Card
                key={item.title}
                className={`card-glow p-3 cursor-pointer hover-lift group ${
                  animate ? 'animate-slide-in-right' : 'opacity-0'
                }`}
                style={{ animationDelay: item.delay }}
                onClick={handleClick}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-gold group-hover:animate-pulse-gold transition-all duration-300">
                    {item.icon === "bdog-silver" ? (
                      <img src={bdogLogo} alt="BDOG" className="w-5 h-5 rounded-full object-cover filter drop-shadow-md" style={{filter: 'drop-shadow(0 0 8px hsl(45 96% 53% / 0.6))'}} />
                    ) : (
                      <IconComponent className="w-5 h-5 icon-gold" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-0 group-hover:text-gold transition-colors animate-text-bounce">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground animate-pulse">
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
          <p className="text-gray-subtle mb-2 animate-pulse">Твоя реклама тут,</p>
          <a 
            href="https://t.me/Deff0xq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light transition-colors underline font-semibold animate-text-glow"
            onClick={playButtonSound}
          >
            пиши нам
          </a>
        </Card>
      </div>
    </div>
  );
};

export default Menu;