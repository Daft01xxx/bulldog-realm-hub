import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Info, Users, Megaphone, Gift, HeadphonesIcon, Pickaxe, Copy, Moon, Sun, Shield, Gamepad2, LogIn } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { AudioManager, playLogoClickSound } from '@/components/AudioManager';
import FallingCoins2D from '@/components/FallingCoins2D';
import FloatingCosmicCoins from '@/components/FloatingCosmicCoins';
import TopNavigation from '@/components/TopNavigation';
import AdminLoginModal from '@/components/AdminLoginModal';

import bdogBackground from "@/assets/bdog-background.png";
import bdogGoldCoin from "@/assets/bulldog-gold-coin.png";
import bdogMainLogo from "@/assets/bdog-main-logo.jpeg";
import bdogTransparentLogo from "@/assets/bulldog-logo-transparent.png";

const Menu = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { isConnected, walletData } = useBdogTonWallet();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [bdogBalance, setBdogBalance] = useState("0");
  const [vBdogBalance, setVBdogBalance] = useState("0");
  const [animate, setAnimate] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [timeUntilNextGift, setTimeUntilNextGift] = useState("");
  const [showCoins, setShowCoins] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminAttempts, setAdminAttempts] = useState(0);

  useEffect(() => {
    // Load user data from profile or localStorage
    if (profile) {
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
        setTimeUntilNextGift(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
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
    
    // Check if admin button should be shown based on access status
    if (profile) {
      const isBlocked = profile.admin_access_blocked === true;
      const attempts = profile.admin_login_attempts || 0;
      setAdminAttempts(attempts);
      setShowAdminButton(!isBlocked);
    } else {
      // Show button by default if no profile yet
      setShowAdminButton(true);
    }
    
    // Trigger animations
    setAnimate(true);
  }, [profile, isConnected, walletData]);
  
  // Update timer every second
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
          setTimeUntilNextGift(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
          setCanClaimDaily(false);
        } else {
          setTimeUntilNextGift("");
          setCanClaimDaily(true);
        }
      } else {
        setCanClaimDaily(true);
        setTimeUntilNextGift("");
      }
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  const claimDailyGift = async () => {
    if (!canClaimDaily) {
      toast({
        title: t('toast.daily.already'),
        description: t('toast.daily.already.desc'),
        variant: "destructive",
        duration: 1000,
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
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      setTimeUntilNextGift(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

      toast({
        title: t('toast.daily.claimed'),
        description: `${t('toast.daily.congrats')} ${reward}`,
        duration: 1000,
      });

      // Navigate to game (tапалки)
      setTimeout(() => {
        navigate('/game');
      }, 1500);
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.daily.fail'),
        variant: "destructive",
        duration: 1000,
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
      title: t('menu.wallet'),
      icon: Wallet,
      path: isConnected ? "/connected-wallet" : "/wallet",
      description: t('menu.wallet.desc'),
      delay: "0.1s",
      fullWidth: false
    },
    {
      title: t('menu.game'),
      icon: Gamepad2,
      path: "/game",
      description: t('menu.game.desc'),
      delay: "0.2s",
      fullWidth: false
    },
    {
      title: t('menu.miner'),
      icon: "miner",
      path: "/miner",
      description: t('menu.miner.desc'),
      delay: "0.25s",
      fullWidth: false
    },
    {
      title: t('menu.info'),
      icon: Info,
      path: "/info",
      description: t('menu.info.desc'),
      delay: "0.3s",
      fullWidth: false
    },
    {
      title: t('menu.referral'),
      icon: Users,
      path: "/referral",
      description: t('menu.referral.desc'),
      delay: "0.4s",
      fullWidth: true
    },
    {
      title: t('menu.promotion'),
      icon: Megaphone,
      path: "/promotion",
      description: t('menu.promotion.desc'),
      delay: "0.5s",
      fullWidth: true
    },
    {
      title: "BDOG ID",
      icon: LogIn,
      path: "/bdog-id-login",
      description: "Вход в BDOG ID",
      delay: "0.55s",
      fullWidth: false
    },
    {
      title: t('menu.support'),
      icon: "support",
      path: "https://t.me/Deff0xq",
      description: t('menu.support.desc'),
      delay: "0.6s",
      external: true,
      fullWidth: false
    }
  ];


  return (
    <div className="min-h-screen bg-background px-2 py-4 relative overflow-hidden">
      <FloatingCosmicCoins />
      {showCoins && <FallingCoins2D count={8} />}
      <TopNavigation />
      {showCoins && <FallingCoins2D count={8} />}
      
      {/* Header with title */}
      <div className="text-center mb-6 pt-16 relative z-10">
        <h1 
          className={`text-5xl font-bold text-gradient mb-4 ${
            animate ? 'animate-bounce-in' : 'opacity-0'
          }`}
        >
          {t('bdog.app')}
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
        
        {/* Balance Card */}
        <Card 
          className={`mx-auto p-4 mb-4 ${
            animate ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          <div className="bg-surface/50 rounded-lg p-3 border border-border/30">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">BDOG:</span>
                <span className="text-gradient font-bold text-lg">
                  {bdogBalance && parseFloat(bdogBalance) > 0 
                    ? parseFloat(bdogBalance).toLocaleString() 
                    : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border/20">
                <span className="text-sm text-muted-foreground">V-BDOG:</span>
                <span className="text-gradient font-bold text-lg">
                  {vBdogBalance && parseFloat(vBdogBalance) > 0 
                    ? parseFloat(vBdogBalance).toLocaleString() 
                    : '0'}
                </span>
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
            {canClaimDaily ? t('menu.daily.gift') : `${t('menu.daily.next')} ${timeUntilNextGift}`}
          </Button>
          <p className="text-xs text-muted-foreground mt-1 opacity-70">
            {canClaimDaily ? t('menu.daily.text') : t('menu.daily.cooldown')}
          </p>
        </div>
      </div>

      <div className="mx-auto relative z-10">
        <div className="grid grid-cols-1 gap-2 mb-4">
          {menuItems.map((item, index) => {
            const IconComponent = typeof item.icon !== "string" ? item.icon : null;
            return (
              <Card
                key={index}
                className={`p-2 cursor-pointer hover-lift group ${animate ? 'animate-slide-in-right' : 'opacity-0'}`}
                style={{ animationDelay: item.delay }}
                onClick={() => {
                  if (item.external) {
                    window.open(item.path, '_blank');
                  } else {
                    navigate(item.path);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-full bg-gradient-gold group-hover:animate-pulse-gold transition-all duration-300">
                    {item.icon === "support" ? (
                      <HeadphonesIcon className="w-4 h-4 icon-gold" />
                    ) : item.icon === "miner" ? (
                      <Pickaxe className="w-4 h-4 icon-gold" />
                    ) : IconComponent ? (
                      <IconComponent className="w-4 h-4 icon-gold" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-foreground mb-0 group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
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
          <p className="text-gray-subtle mb-2">{t('menu.ad.text')}</p>
          <a 
            href="https://t.me/Deff0xq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light transition-colors underline font-semibold"
          >
            {t('menu.ad.link')}
          </a>
        </Card>

        {/* Developer Access Button */}
        {showAdminButton && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="text-xs text-muted-foreground hover:text-gold transition-colors underline opacity-50 hover:opacity-100"
            >
              Для разработчиков
            </button>
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      {profile && (
        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          userId={profile.user_id}
          currentAttempts={adminAttempts}
        />
      )}
    </div>
  );
};

export default Menu;