import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Info, Users, Megaphone, Gift, HeadphonesIcon, Pickaxe, Copy, Moon, Sun, Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { AudioManager, playLogoClickSound } from '@/components/AudioManager';
import FallingCoins2D from '@/components/FallingCoins2D';
import FloatingCosmicCoins from '@/components/FloatingCosmicCoins';
import TopNavigation from '@/components/TopNavigation';

import bdogBackground from "@/assets/bdog-background.png";
import bdogGoldCoin from "@/assets/bulldog-gold-coin.png";
import bdogMainLogo from "@/assets/bdog-main-logo.jpeg";
import bdogTransparentLogo from "@/assets/bulldog-logo-transparent.png";

const Menu = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { isConnected, walletData } = useBdogTonWallet();
  const { theme, toggleTheme } = useTheme();
  const [reg, setReg] = useState("");
  const [bdogBalance, setBdogBalance] = useState("0");
  const [vBdogBalance, setVBdogBalance] = useState("0");
  const [animate, setAnimate] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [timeUntilNextGift, setTimeUntilNextGift] = useState("");
  const [showCoins, setShowCoins] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);

  useEffect(() => {
    // Load user data from profile or localStorage
    if (profile) {
      setReg(profile.reg || "");
      
      // BDOG token balance prioritizing wallet data
      if (isConnected && walletData?.bdogBalance) {
        setBdogBalance(walletData.bdogBalance);
      } else {
        setBdogBalance((profile.bdog_balance || 0).toString());
      }
      
      // V-BDOG balance (unified balance)
      const totalVBdog = profile.v_bdog_earned || 0;
      setVBdogBalance(totalVBdog.toString());
    } else {
      setReg(localStorage.getItem("bdog-reg") || "");
      setBdogBalance("0");
      const localVBdog = localStorage.getItem("bdog-v-bdog-earned") || "0";
      setVBdogBalance(localVBdog);
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
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        setTimeUntilNextGift(`${hours}ч ${minutes}м ${seconds}с`);
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
    
    // Check if admin button should be shown based on IP
    if (profile && profile.ip_address) {
      // Show admin panel for specific IP addresses (add your admin IP here)
      const adminIPs = ['178.205.158.61', '127.0.0.1', 'localhost']; // Add your admin IP addresses here
      setShowAdminButton(adminIPs.includes(profile.ip_address));
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
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
          setTimeUntilNextGift(`${hours}ч ${minutes}м ${seconds}с`);
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
      updateData.v_bdog_earned = (profile?.v_bdog_earned || 0) + 10000;
    } else if (random <= 15) {
      // 5% chance for 20,000 V-BDOG
      reward = "20,000 V-BDOG";
      updateData.v_bdog_earned = (profile?.v_bdog_earned || 0) + 20000;
    } else if (random <= 65) {
      // 50% chance for 100 bones
      reward = "100 косточек";
      updateData.bone = (profile?.bone || 0) + 100;
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
        if (updateData.v_bdog_earned) {
          localStorage.setItem("bdog-v-bdog-earned", updateData.v_bdog_earned.toString());
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

  const handleLogoClick = () => {
    playLogoClickSound();
    setShowCoins(true);
    setTimeout(() => setShowCoins(false), 3000); // Hide coins after 3 seconds
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
      title: "Майнер",
      icon: "miner",
      path: "/miner",
      description: "Пассивный доход V-BDOG",
      delay: "0.25s"
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
    },
    {
      title: "Поддержка",
      icon: "support",
      path: "https://t.me/Deff0xq",
      description: "Связаться с поддержкой",
      delay: "0.6s",
      external: true
    }
  ];

  // Add admin panel button if user has admin IP
  if (showAdminButton) {
    menuItems.splice(-1, 0, {
      title: "Админ панель",
      icon: Shield,
      path: "/admin",
      description: "Управление системой",
      delay: "0.55s"
    });
  }

  return (
    <div className="min-h-screen bg-background px-2 py-4 relative overflow-hidden">
      <FloatingCosmicCoins />
      {showCoins && <FallingCoins2D count={8} />}
      <TopNavigation />
      {showCoins && <FallingCoins2D count={8} />}
      
      {/* Header with title */}
      <div className="text-center mb-6 pt-4 relative z-10">
        <h1 
          className={`text-5xl font-bold text-gradient mb-4 ${
            animate ? 'animate-bounce-in' : 'opacity-0'
          }`}
        >
          BDOG APP
        </h1>

        {/* BDOG Logo */}
        <div 
          className={`mb-6 cursor-pointer ${
            animate ? 'animate-fade-in' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.2s' }}
          onClick={handleLogoClick}
        >
          <img 
            src={bdogMainLogo} 
            alt="BDOG" 
            className="w-32 h-32 mx-auto rounded-full shadow-2xl hover:scale-105 transition-transform duration-300"
            style={{
              filter: 'drop-shadow(0 0 20px hsl(var(--gold) / 0.5))'
            }}
          />
        </div>
        
        {/* User info */}
        <Card 
          className={`mx-auto p-6 mb-4 ${
            animate ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gold font-semibold text-lg">
                {reg && reg.length > 8 ? `${reg.slice(0, 4)}...${reg.slice(-4)}` : reg}
              </span>
              {reg && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(reg);
                      toast({
                        title: "Скопировано!",
                        description: "ID пользователя скопирован в буфер обмена",
                      });
                    } catch {
                      toast({
                        title: "Ошибка",
                        description: "Не удалось скопировать ID",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="h-6 w-6 p-0 hover:bg-gold/10"
                >
                  <Copy className="w-3 h-3 text-gold" />
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {/* Balance Table */}
              <div className="bg-surface/50 rounded-lg p-3 border border-border/30">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">BDOG:</span>
                    <span className="text-gradient font-bold text-lg">{parseFloat(bdogBalance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">V-BDOG:</span>
                    <span className="text-gradient font-bold text-lg">{parseInt(vBdogBalance).toLocaleString()}</span>
                  </div>
                  {profile?.referrals && profile.referrals > 0 && (
                    <div className="flex justify-between items-center pt-1 border-t border-border/20">
                      <span className="text-xs text-gold">Рефералов:</span>
                      <span className="text-xs text-gold font-semibold">{profile.referrals}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Daily Gift Button */}
        <div className="text-center mb-4">
            <Button
            onClick={claimDailyGift}
            disabled={!canClaimDaily}
            className={`button-gradient-gold px-4 py-2 text-sm font-semibold ${
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

      <div className="mx-auto relative z-10">
        <div className="grid grid-cols-1 gap-3 mb-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon !== "bdog-silver" ? item.icon : null;
            return (
              <Card
                key={item.title}
                className={`p-4 cursor-pointer hover-lift group ${
                  animate ? 'animate-slide-in-right' : 'opacity-0'
                }`}
                style={{ animationDelay: item.delay }}
                onClick={() => {
                  if (item.external) {
                    window.open(item.path, '_blank');
                  } else {
                    navigate(item.path);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-gold group-hover:animate-pulse-gold transition-all duration-300">
                    {item.icon === "bdog-silver" ? (
                      <img src={bdogTransparentLogo} alt="BDOG" className="w-8 h-8 object-contain filter drop-shadow-md" style={{filter: 'drop-shadow(0 0 8px hsl(45 96% 53% / 0.6))'}} />
                    ) : item.icon === "support" ? (
                      <HeadphonesIcon className="w-6 h-6 icon-gold" />
                    ) : item.icon === "miner" ? (
                      <Pickaxe className="w-6 h-6 icon-gold" />
                    ) : (
                      <IconComponent className="w-6 h-6 icon-gold" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-0 group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
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
          className={`p-6 text-center relative z-10 ${
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