import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Zap, Info, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { playClickSound, playCoinsSound, playBoosterBuySound } from "@/utils/sounds";
import bulldogSuit from "@/assets/bulldog-suit.jpeg";
import bulldogCoin from "@/assets/bulldog-coin.png";
import tonBlackLogo from "@/assets/ton-black-logo.svg";
import FallingCoins2D from "@/components/FallingCoins2D";
import ShopTabs from "@/components/ShopTabs";
import Shop from "@/components/Shop";
import { useEffect } from "react";

const GameWithTabs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile, loading } = useProfile();
  const [grow, setGrow] = useState(0);
  const [grow1, setGrow1] = useState(1);
  const [bone, setBone] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState("");
  const [clickEffect, setClickEffect] = useState<{id: number, x: number, y: number}[]>([]);
  const [showBooster, setShowBooster] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [topPlayers, setTopPlayers] = useState<{name: string, grow: number}[]>([]);
  const [boosterEndTime, setBoosterEndTime] = useState<number | null>(null);
  const [boosterTimeLeft, setBoosterTimeLeft] = useState("");
  const [totalTaps, setTotalTaps] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [currentTab, setCurrentTab] = useState<'game' | 'shop'>('game');
  const [coinsTriggered, setCoinsTriggered] = useState(false);
  const [currentBulldogLogo, setCurrentBulldogLogo] = useState(bulldogSuit);

  const [isUpdatingFromClick, setIsUpdatingFromClick] = useState(false);

  useEffect(() => {
    console.log('Game useEffect triggered:', { profile: !!profile, isUpdatingFromClick, loading });
    
    if (loading) {
      console.log('Profile is loading, skipping data load');
      return;
    }
    
    if (profile && !isUpdatingFromClick) {
      const profileGrow = Number(profile.grow) || 0;
      let profileGrow1 = Number(profile.grow1) || 1;
      const profileBone = Math.min(1000, Number(profile.bone) || 0);
      
      const profileBoosterExpires = profile.booster_expires_at ? new Date(profile.booster_expires_at).getTime() : null;
      const isBoosterActive = profileBoosterExpires && profileBoosterExpires > Date.now();

      if (!isBoosterActive && profileGrow1 > 1) {
        profileGrow1 = 1;
        updateProfile({ grow1: 1, booster_expires_at: null });
      }

      setGrow(profileGrow);
      setGrow1(profileGrow1);
      setBone(profileBone);
      setBoosterEndTime(profileBoosterExpires);
      
      // Set current bulldog logo from profile
      if (profile.wallet_address) {
        setCurrentBulldogLogo(bulldogSuit);
      }

      localStorage.setItem("bdog-grow", profileGrow.toString());
      localStorage.setItem("bdog-grow1", profileGrow1.toString());
      localStorage.setItem("bdog-bone", profileBone.toString());
      
      if (profileBoosterExpires) {
        localStorage.setItem("bdog-booster-expires", new Date(profileBoosterExpires).toISOString());
        localStorage.setItem("bdog-booster-end", profileBoosterExpires.toString());
      }
    }
  }, [profile, isUpdatingFromClick, loading, updateProfile]);

  useEffect(() => {
    const timer = setInterval(() => {
      calculateTimeLeft();
      calculateWeeklyTimeLeft();
      calculateBoosterTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, [profile, boosterEndTime, grow1]);

  const calculateTimeLeft = () => {
    const moscowTime = new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"});
    const now = new Date(moscowTime);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeLeft("00:00:00");
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const calculateWeeklyTimeLeft = async () => {
    try {
      const { data: nextReset } = await supabase.rpc('get_next_sunday_reset');
      
      if (!nextReset) {
        setWeeklyTimeLeft("0д 00:00:00");
        return;
      }
      
      const resetTime = new Date(nextReset);
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setWeeklyTimeLeft("0д 00:00:00");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setWeeklyTimeLeft(`${days}д ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error('Error calculating weekly time left:', error);
      setWeeklyTimeLeft("Ошибка расчета");
    }
  };

  const calculateBoosterTimeLeft = () => {
    const expirationTime = profile?.booster_expires_at ? new Date(profile.booster_expires_at).getTime() : boosterEndTime;
    
    if (!expirationTime) {
      setBoosterTimeLeft("");
      return;
    }

    const now = Date.now();
    if (now >= expirationTime) {
      if (grow1 > 1) {
        setIsUpdatingFromClick(true);
        
        const resetGrow1 = 1;
        setGrow1(resetGrow1);
        
        localStorage.setItem("bdog-grow1", resetGrow1.toString());
        localStorage.removeItem("bdog-booster-end");
        localStorage.removeItem("bdog-booster-expires");
        
        updateProfile({ grow1: resetGrow1, booster_expires_at: null });
        
        setTimeout(() => {
          setIsUpdatingFromClick(false);
        }, 2000);
      }
      
      setBoosterEndTime(null);
      setBoosterTimeLeft("");
      
      toast({
        title: "Ускоритель закончился",
        description: "Рост вернулся к нормальному значению",
      });
      return;
    }

    const diff = expirationTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setBoosterTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleClick = async (event: React.MouseEvent) => {
    if (bone <= 0) {
      toast({
        title: "Закончились косточки",
        description: "Подождите до завтра для восстановления",
        variant: "destructive",
      });
      return;
    }

    // Play coins sound
    playCoinsSound();

    // Trigger 2D coins animation
    setCoinsTriggered(true);
    setTimeout(() => setCoinsTriggered(false), 100);

    // Simple vibration for all devices including iPhone
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Click animation effect
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);

    const currentGrow = Number(grow) || 0;
    const currentGrow1 = Number(grow1) || 1;
    const currentBone = Number(bone) || 0;
    const currentTotalTaps = Number(totalTaps) || 0;
    
    const newGrow = currentGrow + currentGrow1;
    const newBone = Math.max(0, currentBone - 1);
    const newTotalTaps = currentTotalTaps + 1;

    setGrow(newGrow);
    setBone(newBone);
    setTotalTaps(newTotalTaps);
    
    localStorage.setItem("bdog-grow", newGrow.toString());
    localStorage.setItem("bdog-bone", newBone.toString());
    localStorage.setItem("bdog-total-taps", newTotalTaps.toString());

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const effectId = Date.now();
    setClickEffect(prev => [...prev, { id: effectId, x, y }]);
    
    setTimeout(() => {
      setClickEffect(prev => prev.filter(effect => effect.id !== effectId));
    }, 1000);

    try {
      if (profile) {
        await updateProfile({
          grow: newGrow,
          bone: newBone
        });
      }
    } catch (error) {
      console.error('Error updating profile after click:', error);
    }
  };

  const buyBooster = async () => {
    playClickSound();
    
    const profileBone = Number(profile?.bone) || 0;
    const localBone = Number(localStorage.getItem("bdog-bone")) || 0;
    const currentBone = Math.min(1000, profileBone ?? localBone ?? bone);
    if (currentBone < 500) {
      toast({
        title: "Ошибка!",
        description: "У вас недостаточно косточек",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingFromClick(true);

    const newBone = Math.min(1000, currentBone - 500);
    const newGrow1 = grow1 * 2;
    const expirationTime = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour from now
    
    setBone(newBone);
    setGrow1(newGrow1);
    setBoosterEndTime(expirationTime.getTime());
    
    localStorage.setItem("bdog-bone", newBone.toString());
    localStorage.setItem("bdog-grow1", newGrow1.toString());
    localStorage.setItem("bdog-booster-expires", expirationTime.toISOString());
    localStorage.setItem("bdog-booster-end", expirationTime.getTime().toString());
    
    await updateProfile({
      bone: newBone,
      grow1: newGrow1,
      booster_expires_at: expirationTime.toISOString()
    });
    
    setTimeout(() => {
      setIsUpdatingFromClick(false);
    }, 2000);
    
    setShowBooster(false);
    
    playBoosterBuySound();
    
    toast({
      title: "Ускоритель активирован!",
      description: "Рост удвоен на 1 час",
    });
  };

  if (currentTab === 'shop') {
    return (
      <ShopTabs currentTab={currentTab} onTabChange={setCurrentTab}>
        <Shop />
      </ShopTabs>
    );
  }

  return (
    <ShopTabs currentTab={currentTab} onTabChange={setCurrentTab}>
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Large BDOG coin at the top */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 z-10">
          <img 
            src={bulldogCoin} 
            alt="BDOG Coin" 
            className="w-full h-full object-contain opacity-20"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative min-h-screen pb-24 px-2 py-4 overflow-y-auto">
        <FallingCoins2D trigger={coinsTriggered} />
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="button-outline-gold text-xs px-2 py-1"
          >
            <ArrowLeft className="w-3 h-3 mr-1 text-gold" />
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tasks")}
            className="button-outline-gold text-xs px-2 py-1"
          >
            <ClipboardList className="w-3 h-3 mr-1 text-gold" />
            Задания
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/menu")}
            className="button-outline-gold text-xs px-2 py-1"
          >
            <Home className="w-3 h-3 mr-1 text-gold" />
            Меню
          </Button>
        </div>

        {/* Game stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 max-w-sm mx-auto">
          <Card className="card-glow p-2 text-center animate-fade-in-up">
            <p className="text-xs text-muted-foreground">Рост</p>
            <p className="text-sm font-bold text-gold">{grow.toLocaleString()}</p>
          </Card>
          
          <Card className="card-glow p-2 text-center animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <p className="text-xs text-muted-foreground">Косточки</p>
            <p className="text-sm font-bold text-foreground">{bone}</p>
          </Card>
          
          <Card className="card-glow p-2 text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <p className="text-xs text-muted-foreground">Сброс через</p>
            <p className="text-xs font-bold text-gold">{timeLeft}</p>
          </Card>
        </div>

        {/* Game area */}
        <div className="relative flex flex-col items-center space-y-6 max-w-sm mx-auto">
          <div className="relative">
            <div 
              className={`relative cursor-pointer transition-all duration-150 ${isClicked ? 'scale-95' : 'hover:scale-105'}`}
              onClick={handleClick}
            >
              <div className="w-48 h-48 md:w-56 md:h-56 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <img 
                  src={currentBulldogLogo} 
                  alt="Bulldog" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {clickEffect.map((effect) => (
              <div
                key={effect.id}
                className="absolute pointer-events-none animate-bounce-up text-gold font-bold text-lg"
                style={{
                  left: effect.x,
                  top: effect.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                +{grow1}
              </div>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <Button 
              onClick={() => setShowBooster(true)}
              variant="outline" 
              size="sm"
              className="button-outline-gold"
            >
              <Zap className="w-4 h-4 mr-2 text-gold" />
              Ускоритель
            </Button>
            <Button 
              onClick={() => setShowRules(true)}
              variant="outline" 
              size="sm"
              className="button-outline-gold"
            >
              <Info className="w-4 h-4 mr-2 text-gold" />
              Правила
            </Button>
          </div>

          {boosterTimeLeft && (
            <Card className="card-glow p-3 text-center animate-bounce-in">
              <p className="text-xs text-muted-foreground mb-1">Ускоритель активен</p>
              <p className="text-lg font-bold text-gold">{boosterTimeLeft}</p>
              <p className="text-xs text-green-600">Рост x{grow1}</p>
            </Card>
          )}

          <Card className="card-glow p-3 w-full animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Еженедельный сброс</h3>
              <img src={tonBlackLogo} alt="TON" className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              До сброса: {weeklyTimeLeft}
            </p>
            <div className="text-xs text-muted-foreground">
              <p>V-BDOG заработано: {profile?.v_bdog_earned?.toLocaleString() || 0}</p>
              <p>Всего кликов: {totalTaps}</p>
            </div>
          </Card>
        </div>

        {/* Modals */}
        {showBooster && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="card-glow p-6 max-w-sm animate-bounce-in">
              <h3 className="text-xl font-bold text-foreground mb-4">Ускоритель</h3>
              <p className="text-muted-foreground mb-6">
                Ускоритель удваивает рост, который вы получаете при клике. Действует в течение 1 часа.
              </p>
              <div className="flex gap-2">
                <Button onClick={buyBooster} className="button-gold flex-1">
                  Купить (500)
                </Button>
                <Button 
                  onClick={() => setShowBooster(false)}
                  variant="outline"
                  className="button-outline-gold"
                >
                  Отмена
                </Button>
              </div>
            </Card>
          </div>
        )}

        {showRules && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="card-glow p-6 max-w-md animate-bounce-in">
              <h3 className="text-xl font-bold text-foreground mb-4">Правила игры</h3>
              <p className="text-muted-foreground mb-6">
                Выполняй задания и получай кости, корми бульдога и прокачивай его рост. 
                В конце каждой недели те кто входят в топ роста получают V-BDOG 
                (Токены BDOG, которые после декса можно будет обменять на монеты $BDOG)
              </p>
              <Button 
                onClick={() => setShowRules(false)}
                className="button-gold w-full"
              >
                Понятно
              </Button>
            </Card>
          </div>
        )}
      </div>
    </ShopTabs>
  );
};

export default GameWithTabs;