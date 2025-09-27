import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Home, Zap, Info, ClipboardList, ShoppingCart, Gamepad2, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import bulldogLogoTransparent from "@/assets/bulldog-logo-transparent.png";
import { AudioManager, playTapSound, playLogoClickSound, playButtonClickSound } from '@/components/AudioManager';
import TopNavigation from '@/components/TopNavigation';
import GameShop from '@/components/GameShop';
import { BoneFarmGame } from '@/components/BoneFarmGame';

const Game = () => {
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
  const [activeTab, setActiveTab] = useState("game");
  const [keys, setKeys] = useState(3);
  const [boneFarmRecord, setBoneFarmRecord] = useState(0);
  const [activeTouches, setActiveTouches] = useState<Set<number>>(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const [isUpdatingFromClick, setIsUpdatingFromClick] = useState(false);

  useEffect(() => {
    console.log('Game useEffect triggered:', { profile: !!profile, isUpdatingFromClick, loading });
    
    // Don't load data if we're still loading profile
    if (loading) {
      console.log('Profile is loading, skipping data load');
      return;
    }
    
    // Load game data from profile or localStorage ONLY once when profile is loaded
    if (profile && !isUpdatingFromClick) {
      const profileGrow = Number(profile.grow) || 0;
      let profileGrow1 = Number(profile.grow1) || 1;
      const profileBone = Number(profile.bone) || 0;
      
      // Check if booster is active and adjust grow1 accordingly
      const profileBoosterExpires = profile.booster_expires_at ? new Date(profile.booster_expires_at).getTime() : null;
      const isBoosterActive = profileBoosterExpires && profileBoosterExpires > Date.now();
      
      if (isBoosterActive) {
        // If booster is active, ensure grow1 is at least 2
        if (profileGrow1 < 2) {
          profileGrow1 = 2;
        }
        setBoosterEndTime(profileBoosterExpires);
        localStorage.setItem("bdog-booster-end", profileBoosterExpires.toString());
        localStorage.setItem("bdog-booster-expires", profile.booster_expires_at!);
      } else {
        // If booster is not active, ensure grow1 is 1
        profileGrow1 = 1;
        setBoosterEndTime(null);
        localStorage.removeItem("bdog-booster-end");
        localStorage.removeItem("bdog-booster-expires");
      }
      
      console.log('Loading from profile:', { profileGrow, profileGrow1, profileBone, isBoosterActive });
      console.log('Current local state:', { grow, grow1, bone });
      
      // Update states if different from profile
      if (Math.abs(grow - profileGrow) > 0) {
        console.log('Updating grow from profile:', profileGrow);
        setGrow(profileGrow);
      }
      if (grow1 !== profileGrow1) {
        console.log('Updating grow1 from profile:', profileGrow1);
        setGrow1(profileGrow1);
        localStorage.setItem("bdog-grow1", profileGrow1.toString());
      }
      if (Math.abs(bone - profileBone) > 0) {
        console.log('Updating bone from profile:', profileBone);
        setBone(profileBone);
      }
      
      // Load new bone farming fields (using any to avoid type errors)
      const profileData = profile as any;
      const profileKeys = Number(profileData.keys) || 3;
      const profileBoneFarmRecord = Number(profileData.bone_farm_record) || 0;
      
      setKeys(profileKeys);
      setBoneFarmRecord(profileBoneFarmRecord);
      
      // Check if keys need daily reset
      const lastReset = profileData.last_key_reset ? new Date(profileData.last_key_reset) : new Date();
      const today = new Date();
      if (today.toDateString() !== lastReset.toDateString()) {
        // Reset keys to 3 and update last reset date
        setKeys(3);
        updateProfile({ 
          keys: 3, 
          last_key_reset: today.toISOString().split('T')[0] 
        } as any);
      }
      
    } else if (!profile && !loading && !isUpdatingFromClick && grow === 0) {
      // Load from localStorage only if we're not loading and don't have any data yet
      const savedGrow = Number(localStorage.getItem("bdog-grow")) || 0;
      const savedGrow1 = Number(localStorage.getItem("bdog-grow1")) || 1;
      const savedBoneStr = localStorage.getItem("bdog-bone");
      const savedBone = savedBoneStr !== null ? Number(savedBoneStr) : 0; // Start with 0 bones
      const savedBoosterEndTime = localStorage.getItem("bdog-booster-end");
      
      console.log('Loading from localStorage:', { savedGrow, savedGrow1, savedBone });
      
      setGrow(savedGrow);
      setBone(savedBone);
      
      // Check if booster is still active from localStorage
      if (savedBoosterEndTime) {
        const endTime = parseInt(savedBoosterEndTime);
        if (endTime > Date.now()) {
          setGrow1(Math.max(savedGrow1, 2)); // Ensure at least 2 if booster active
          setBoosterEndTime(endTime);
        } else {
          setGrow1(1); // Reset to 1 if booster expired
          localStorage.removeItem("bdog-booster-end");
          localStorage.removeItem("bdog-booster-expires");
        }
      } else {
        setGrow1(savedGrow1);
      }
    }
    
    // Load total taps count only once
    if (totalTaps === 0) {
      setTotalTaps(Number(localStorage.getItem("bdog-total-taps")) || 0);
    }
    
    // Load top players
    loadTopPlayers();
    
    // Reset and restart timers
    calculateTimeLeft();
    calculateWeeklyTimeLeft();
    calculateBoosterTimeLeft();
    
    const timer = setInterval(() => {
      calculateTimeLeft();
      calculateWeeklyTimeLeft();
      calculateBoosterTimeLeft();
    }, 1000);
    return () => clearInterval(timer);
  }, [profile, loading]); // Added loading dependency

  const loadTopPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('reg, grow')
        .order('grow', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading top players:', error);
        return;
      }

      if (data && data.length > 0) {
        const players = data.map(player => ({
          name: player.reg || 'Anonymous',
          grow: player.grow || 0
        }));
        setTopPlayers(players);
      }
    } catch (error) {
      console.error('Error loading top players:', error);
    }
  };

  const calculateTimeLeft = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const calculateWeeklyTimeLeft = async () => {
    try {
      // Get next Sunday 10:00 AM Moscow time from database function
      const { data: nextReset, error } = await supabase.rpc('get_next_sunday_reset');
      
      if (error) {
        console.error('Error getting next reset time:', error);
        // Fallback to local calculation
        const now = new Date();
        const nextSunday = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7;
        if (daysUntilSunday === 0 && now.getHours() >= 10) {
          nextSunday.setDate(now.getDate() + 7);
        } else {
          nextSunday.setDate(now.getDate() + daysUntilSunday);
        }
        nextSunday.setHours(20, 0, 0, 0); // 20:00 (8 PM)
        
        const diff = nextSunday.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setWeeklyTimeLeft(`${days}д ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        return;
      }
      
      const resetTime = new Date(nextReset);
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        // Timer expired, calculate next reset automatically
        await calculateWeeklyTimeLeft();
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
    // Check if user has active booster from profile
    const expirationTime = profile?.booster_expires_at ? new Date(profile.booster_expires_at).getTime() : boosterEndTime;
    
    if (!expirationTime) {
      setBoosterTimeLeft("");
      return;
    }

    const now = Date.now();
    if (now >= expirationTime) {
      // Booster expired, reset grow1 only once
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
      
      // Removed toast notification for booster expiration
      return;
    }

    const diff = expirationTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setBoosterTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleClick = async (event: React.MouseEvent | React.TouchEvent) => {
    // Prevent default touch behaviors
    event.preventDefault();
    event.stopPropagation();
    
    const currentBone = Number(bone) || 0;
    
    // Strict check - prevent any action if bones are 0 or less
    if (currentBone <= 0) {
      toast({
        title: "Закончились косточки",
        description: "Подождите до завтра для восстановления",
        variant: "destructive",
      });
      return;
    }

    let clickCount = 1;
    let touchPoints: { x: number, y: number }[] = [];

    // Handle multi-touch
    if ('touches' in event) {
      const touchEvent = event as React.TouchEvent;
      clickCount = touchEvent.touches.length;
      
      // Get all touch points for visual effects
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      for (let i = 0; i < touchEvent.touches.length; i++) {
        const touch = touchEvent.touches[i];
        touchPoints.push({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        });
      }
    } else {
      // Mouse event - single point
      const mouseEvent = event as React.MouseEvent;
      const rect = (mouseEvent.target as HTMLElement).getBoundingClientRect();
      touchPoints.push({
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top,
      });
    }

    // Check if we have enough bones for all clicks
    if (currentBone < clickCount) {
      clickCount = currentBone; // Only use as many clicks as we have bones
    }

    if (clickCount <= 0) return;

    // Simple and reliable vibration for all devices including iPhone
    if (navigator.vibrate) {
      navigator.vibrate([50]); // Single vibration for multiple touches
    }

    // Play tap sound
    playTapSound();

    // Click animation effect
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 100);

    const currentGrow = Number(grow) || 0;
    const currentGrow1 = Number(grow1) || 1;
    const currentTotalTaps = Number(totalTaps) || 0;
    
    const growPerClick = currentGrow1;
    const newGrow = currentGrow + (growPerClick * clickCount);
    const newBone = currentBone - clickCount;
    const newTotalTaps = currentTotalTaps + clickCount;
    
    console.log('Multi-touch click debug:', {
      clickCount,
      currentGrow,
      growPerClick,
      newGrow,
      currentBone,
      newBone,
    });
    
    // Set flag to prevent profile reload from overriding our changes
    setIsUpdatingFromClick(true);
    
    setGrow(newGrow);
    setBone(newBone);
    setTotalTaps(newTotalTaps);
    
    localStorage.setItem("bdog-grow", String(newGrow));
    localStorage.setItem("bdog-bone", String(newBone));
    localStorage.setItem("bdog-total-taps", String(newTotalTaps));
    
    // Throttle database updates - only update if enough time has passed
    const now = Date.now();
    if (now - lastUpdateTime > 500) { // Update DB max every 500ms
      setLastUpdateTime(now);
      updateProfile({
        grow: newGrow,
        bone: newBone
      });
    }
    
    // Reset the flag faster for better responsiveness
    setTimeout(() => {
      setIsUpdatingFromClick(false);
    }, 300);

    // Create click effects for all touch points
    touchPoints.forEach((point, index) => {
      const effectId = Date.now() + Math.random() + index;
      setClickEffect(prev => [...prev, { id: effectId, x: point.x, y: point.y }]);
      
      setTimeout(() => {
        setClickEffect(prev => prev.filter(effect => effect.id !== effectId));
      }, 300);
    });
  };

  const handleKeysUpdate = (newKeys: number) => {
    setKeys(newKeys);
    updateProfile({ keys: newKeys } as any);
  };

  const handleBonesEarned = (bones: number) => {
    const newBone = bone + bones;
    setBone(newBone);
    localStorage.setItem("bdog-bone", String(newBone));
    updateProfile({ bone: newBone });
  };

  const handleRecordUpdate = (record: number) => {
    if (record > boneFarmRecord) {
      setBoneFarmRecord(record);
      updateProfile({ bone_farm_record: record } as any);
    }
  };

  const buyBooster = async () => {
    const currentBone = profile?.bone || Number(localStorage.getItem("bdog-bone")) || bone;
    if (currentBone < 500) {
      toast({
        title: "Ошибка!",
        description: "У вас недостаточно косточек",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingFromClick(true);

    const newBone = currentBone - 500;
    const newGrow1 = grow1 * 2;
    const expirationTime = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour from now
    
    // Update local state immediately
    setBone(newBone);
    setGrow1(newGrow1);
    setBoosterEndTime(expirationTime.getTime());
    
    // Update localStorage
    localStorage.setItem("bdog-bone", newBone.toString());
    localStorage.setItem("bdog-grow1", newGrow1.toString());
    localStorage.setItem("bdog-booster-expires", expirationTime.toISOString());
    localStorage.setItem("bdog-booster-end", expirationTime.getTime().toString());
    
    // Update profile in database
    await updateProfile({
      bone: newBone,
      grow1: newGrow1,
      booster_expires_at: expirationTime.toISOString()
    });
    
    setTimeout(() => {
      setIsUpdatingFromClick(false);
    }, 2000);
    
    setShowBooster(false);
    
    toast({
      title: "Ускоритель активирован!",
      description: "Рост удвоен на 1 час",
    });
  };


  return (
    <div className="min-h-screen bg-background px-2 py-4">
      <AudioManager backgroundMusic={true} volume={0.1} />
      <TopNavigation />
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger 
            value="game" 
            className="flex items-center gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            <Gamepad2 className="w-4 h-4" />
            Игра
          </TabsTrigger>
          <TabsTrigger 
            value="shop" 
            className="flex items-center gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            <ShoppingCart className="w-4 h-4" />
            Магазин
          </TabsTrigger>
          <TabsTrigger 
            value="bonefarm" 
            className="flex items-center gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            <Coins className="w-4 h-4" />
            Фарм
          </TabsTrigger>
        </TabsList>

        <TabsContent value="game" className="space-y-4">
          {/* Game stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 max-w-sm mx-auto">
            <Card className="card-glow p-2 text-center animate-fade-in-up">
              <p className="text-xs text-muted-foreground">Рост</p>
              <p className="text-sm font-bold text-gold">{grow.toLocaleString()}</p>
            </Card>
            
            <Card className="card-glow p-2 text-center animate-fade-in-up">
              <p className="text-xs text-muted-foreground">Косточки</p>
              <p className="text-sm font-bold text-gold">{bone}</p>
            </Card>
            
            <Card className="card-glow p-2 text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <p className="text-xs text-muted-foreground">Сброс через</p>
              <p className="text-xs font-bold text-gold">{timeLeft}</p>
            </Card>
          </div>

          {/* Game area */}
          <div className="text-center mb-4">
            <Card className="card-glow p-4 max-w-xs mx-auto relative overflow-hidden animate-bounce-in">
              <div 
                className="relative cursor-pointer group select-none"
                onClick={handleClick}
                onTouchStart={handleClick}
                style={{ touchAction: 'manipulation' }}
              >
                <img 
                  src={bulldogLogoTransparent}
                  alt="BDOG"
              className={`w-40 h-40 mx-auto rounded-full object-contain transition-all duration-150 ease-out ${
                isClicked 
                  ? 'scale-105 brightness-105' 
                  : 'scale-100 hover:scale-102'
              }`}
                  style={{
                filter: 'brightness(1.1) contrast(1.05) saturate(1.1) drop-shadow(0 0 10px hsl(var(--gold) / 0.3))'
                  }}
                />
                
                {/* Click effects */}
                {clickEffect.map((effect) => (
                  <div
                    key={effect.id}
                    className="absolute pointer-events-none text-gold font-bold text-lg animate-bounce-in"
                    style={{
                      left: effect.x,
                      top: effect.y,
                      animation: 'bounce-in 0.5s ease-out forwards',
                    }}
                  >
                    {bone > 0 ? `+${grow1}` : "Закончились косточки"}
                  </div>
                ))}
              </div>
              
              <p className="text-sm font-semibold text-foreground mt-2">
                Нажми на бульдога!
              </p>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-2 mb-6">
            {boosterEndTime && boosterTimeLeft ? (
              <div className="bg-primary/20 border border-primary/30 rounded-md px-2 py-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold animate-pulse" />
                <span className="text-primary font-semibold text-xs">{boosterTimeLeft}</span>
              </div>
            ) : (
              <Button
                onClick={() => setShowBooster(true)}
                className="button-gold group text-xs px-3 py-2"
              >
                <Zap className="w-3 h-3 mr-1 text-gold group-hover:animate-pulse" />
                Ускорить
              </Button>
            )}
            
            <Button
              onClick={() => setShowRules(true)}
              variant="outline"
              className="button-outline-gold group text-xs px-3 py-2"
            >
              <Info className="w-3 h-3 mr-1 text-gold group-hover:animate-pulse" />
              Правила
            </Button>
          </div>

          {/* Ad space */}
          <Card className="card-glow p-3 text-center mb-6 max-w-xs mx-auto animate-fade-in-up">
            <p className="text-muted-foreground text-xs mb-1">Твоя реклама тут,</p>
            <a 
              href="https://t.me/Deff0xq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors underline text-xs font-semibold"
            >
              пиши нам
            </a>
          </Card>

          {/* Top players */}
          {topPlayers.length > 0 && (
          <div className="max-w-xs mx-auto animate-slide-in-right">
            <h3 className="text-lg font-bold text-foreground mb-3 text-center">
              🏆 Топ роста
            </h3>
              
              <Card className="card-glow p-3">
                <div className="text-center mb-3 border-b border-border pb-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    Еженедельный сброс через:
                  </div>
                  <div className="text-sm font-bold text-gold">
                    {weeklyTimeLeft}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Топ-5 получат по 5,000,000 V-BDOG!<br/>
                    <span className="text-xs">Воскресенье 20:00 (МСК)</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {topPlayers.map((player, index) => (
                    <div 
                      key={player.name + index} 
                      className={`flex justify-between items-center p-2 rounded text-xs ${
                        index === 0 ? 'bg-gold/20 border border-gold/30' : 
                        index === 1 ? 'bg-gray-400/20 border border-gray-400/30' : 
                        index === 2 ? 'bg-orange-600/20 border border-orange-600/30' : 
                        'bg-muted/50'
                      }`}
                    >
                      <span className="flex items-center">
                        <span className="font-bold mr-1 text-xs">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <span className="text-foreground">{player.name}</span>
                      </span>
                      <span className="text-gold font-semibold">
                        {player.grow.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shop">
          <div className="max-w-sm mx-auto">
            <GameShop 
              bone={bone}
              setBone={setBone}
              profile={profile}
            />
          </div>
        </TabsContent>

        <TabsContent value="bonefarm">
          <BoneFarmGame 
            keys={keys}
            onKeysUpdate={handleKeysUpdate}
            onBonesEarned={handleBonesEarned}
            onRecordUpdate={handleRecordUpdate}
          />
        </TabsContent>
      </Tabs>

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
  );
};

export default Game;