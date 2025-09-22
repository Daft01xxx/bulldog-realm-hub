import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Zap, Info, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import bulldogSuit from "@/assets/bulldog-suit.jpeg";

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  const [grow, setGrow] = useState(0);
  const [grow1, setGrow1] = useState(1);
  const [bone, setBone] = useState(1000);
  const [timeLeft, setTimeLeft] = useState("");
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState("");
  const [clickEffect, setClickEffect] = useState<{id: number, x: number, y: number}[]>([]);
  const [showBooster, setShowBooster] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [topPlayers, setTopPlayers] = useState<{name: string, grow: number}[]>([]);
  const [boosterEndTime, setBoosterEndTime] = useState<number | null>(null);
  const [boosterTimeLeft, setBoosterTimeLeft] = useState("");
  const [totalTaps, setTotalTaps] = useState(0);

  const [isUpdatingFromClick, setIsUpdatingFromClick] = useState(false);

  useEffect(() => {
    // Load game data from profile or localStorage ONLY once when profile is first loaded
    if (profile && !isUpdatingFromClick) {
      const profileGrow = Number(profile.grow) || 0;
      const profileGrow1 = Number(profile.grow1) || 1;
      const profileBone = Math.min(1000, Number(profile.bone) || 1000);
      
      // Only update if local state is different from profile (to avoid constant resets)
      if (grow !== profileGrow) setGrow(profileGrow);
      if (grow1 !== profileGrow1) setGrow1(profileGrow1);
      if (bone !== profileBone) setBone(profileBone);
      
    } else if (!profile && !isUpdatingFromClick && grow === 0) {
      // Load from localStorage only if we don't have any data yet
      const savedGrow = Number(localStorage.getItem("bdog-grow")) || 0;
      const savedGrow1 = Number(localStorage.getItem("bdog-grow1")) || 1;
      const savedBone = Number(localStorage.getItem("bdog-bone")) || 1000;
      
      setGrow(savedGrow);
      setGrow1(savedGrow1);
      setBone(Math.min(1000, savedBone));
    }
    
    // Load total taps count only once
    if (totalTaps === 0) {
      setTotalTaps(Number(localStorage.getItem("bdog-total-taps")) || 0);
    }
    
    // Load booster end time from profile or localStorage
    const profileBoosterExpires = profile?.booster_expires_at ? new Date(profile.booster_expires_at).getTime() : null;
    const savedBoosterEndTime = localStorage.getItem("bdog-booster-end");
    
    if (profileBoosterExpires && profileBoosterExpires > Date.now()) {
      setBoosterEndTime(profileBoosterExpires);
    } else if (savedBoosterEndTime) {
      const endTime = parseInt(savedBoosterEndTime);
      if (endTime > Date.now()) {
        setBoosterEndTime(endTime);
      } else {
        localStorage.removeItem("bdog-booster-end");
        localStorage.removeItem("bdog-booster-expires");
      }
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
  }, [profile, isUpdatingFromClick]);

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

    const currentGrow = Number(grow) || 0;
    const currentGrow1 = Number(grow1) || 1;
    const currentBone = Number(bone) || 0;
    const currentTotalTaps = Number(totalTaps) || 0;
    
    const newGrow = currentGrow + currentGrow1;
    const newBone = Math.max(0, currentBone - 1);
    const newTotalTaps = currentTotalTaps + 1;
    
    console.log('Click debug:', {
      currentGrow,
      currentGrow1,
      newGrow,
      currentBone,
      newBone,
      localStorage_grow: localStorage.getItem("bdog-grow")
    });
    
    // Set flag to prevent profile reload from overriding our changes
    setIsUpdatingFromClick(true);
    
    setGrow(newGrow);
    setBone(newBone);
    setTotalTaps(newTotalTaps);
    
    localStorage.setItem("bdog-grow", String(newGrow));
    localStorage.setItem("bdog-bone", String(newBone));
    localStorage.setItem("bdog-total-taps", String(newTotalTaps));
    
    // Update profile in database
    await updateProfile({
      grow: newGrow,
      bone: newBone
    });
    
    // Reset the flag after a delay to allow profile updates again
    setTimeout(() => {
      setIsUpdatingFromClick(false);
    }, 2000);

    // Click effect animation
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const effectId = Date.now();
    setClickEffect(prev => [...prev, { id: effectId, x, y }]);
    
    setTimeout(() => {
      setClickEffect(prev => prev.filter(effect => effect.id !== effectId));
    }, 500);
  };

  const buyBooster = async () => {
    const currentBone = Math.min(1000, profile?.bone || Number(localStorage.getItem("bdog-bone")) || bone);
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
      <div className="text-center mb-4">
        <Card className="card-glow p-4 max-w-xs mx-auto relative overflow-hidden animate-bounce-in">
          <div 
            className="relative cursor-pointer group"
            onClick={handleClick}
          >
            <img 
              src={bulldogSuit}
              alt="BDOG"
              className="w-32 h-32 mx-auto rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <p className="text-gray-subtle text-xs mb-1">Твоя реклама тут,</p>
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
        <div className="max-w-xs mx-auto animate-slide-in-right" style={{animationDelay: '0.3s'}}>
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