import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Zap, Info } from "lucide-react";
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
  const [clickEffect, setClickEffect] = useState<{id: number, x: number, y: number}[]>([]);
  const [showBooster, setShowBooster] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [topPlayers, setTopPlayers] = useState<{name: string, grow: number}[]>([]);
  const [boosterEndTime, setBoosterEndTime] = useState<number | null>(null);
  const [boosterTimeLeft, setBoosterTimeLeft] = useState("");

  useEffect(() => {
    // Load game data from profile or localStorage
    if (profile) {
      setGrow(profile.grow);
      setGrow1(profile.grow1);
      setBone(Math.min(1000, profile.bone)); // Ensure bone doesn't exceed 1000
    } else {
      setGrow(Number(localStorage.getItem("bdog-grow")) || 0);
      setGrow1(Number(localStorage.getItem("bdog-grow1")) || 1);
      setBone(Math.min(1000, Number(localStorage.getItem("bdog-bone")) || 1000)); // Ensure bone doesn't exceed 1000
    }
    
    // Load booster end time from localStorage
    const savedBoosterEndTime = localStorage.getItem("bdog-booster-end");
    if (savedBoosterEndTime) {
      const endTime = parseInt(savedBoosterEndTime);
      if (endTime > Date.now()) {
        setBoosterEndTime(endTime);
      } else {
        localStorage.removeItem("bdog-booster-end");
      }
    }
    
    // Load top players
    loadTopPlayers();
    
    calculateTimeLeft();
    const timer = setInterval(() => {
      calculateTimeLeft();
      calculateBoosterTimeLeft();
    }, 1000);
    return () => clearInterval(timer);
  }, [profile]);

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

  const calculateBoosterTimeLeft = () => {
    if (!boosterEndTime) {
      setBoosterTimeLeft("");
      return;
    }

    const now = Date.now();
    if (now >= boosterEndTime) {
      // Booster expired, reset grow1
      const resetGrow1 = Math.max(1, grow1 / 2);
      setGrow1(resetGrow1);
      updateProfile({ grow1: resetGrow1 });
      localStorage.setItem("bdog-grow1", resetGrow1.toString());
      localStorage.removeItem("bdog-booster-end");
      setBoosterEndTime(null);
      setBoosterTimeLeft("");
      
      toast({
        title: "Ускоритель закончился",
        description: "Рост вернулся к нормальному значению",
      });
      return;
    }

    const diff = boosterEndTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setBoosterTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (bone <= 0) {
      toast({
        title: "Закончились косточки",
        description: "Подождите до завтра для восстановления",
        variant: "destructive",
      });
      return;
    }

    const newGrow = grow + grow1;
    const newBone = Math.max(0, bone - 1); // Ensure bone doesn't go below 0
    
    setGrow(newGrow);
    setBone(newBone);
    
    // Update profile in database
    updateProfile({
      grow: newGrow,
      bone: newBone
    });
    
    localStorage.setItem("bdog-grow", newGrow.toString());
    localStorage.setItem("bdog-bone", newBone.toString());

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

  const buyBooster = () => {
    const currentBone = profile?.bone || Number(localStorage.getItem("bdog-bone")) || bone;
    if (currentBone < 500) {
      toast({
        title: "Ошибка!",
        description: "У вас недостаточно косточек",
        variant: "destructive",
      });
      return;
    }

    const newBone = Math.min(1000, currentBone - 500); // Ensure bone doesn't exceed 1000
    const newGrow1 = grow1 * 2;
    const endTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
    
    // Update profile in database
    updateProfile({
      bone: newBone,
      grow1: newGrow1
    });
    
    localStorage.setItem("bdog-bone", newBone.toString());
    localStorage.setItem("bdog-grow1", newGrow1.toString());
    localStorage.setItem("bdog-booster-end", endTime.toString());
    
    setBone(newBone);
    setGrow1(newGrow1);
    setBoosterEndTime(endTime);
    
    setShowBooster(false);
    
    toast({
      title: "Ускоритель активирован!",
      description: "Рост удвоен на 1 час",
    });
  };


  return (
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold"
        >
          <Home className="w-4 h-4 mr-2" />
          Меню
        </Button>
      </div>

      {/* Game stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
        <Card className="card-glow p-4 text-center animate-fade-in-up">
          <p className="text-sm text-muted-foreground">Рост</p>
          <p className="text-xl font-bold text-gold">{grow.toLocaleString()}</p>
        </Card>
        
        <Card className="card-glow p-4 text-center animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <p className="text-sm text-muted-foreground">Косточки</p>
          <p className="text-xl font-bold text-foreground">{bone}</p>
        </Card>
        
        <Card className="card-glow p-4 text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <p className="text-sm text-muted-foreground">Сброс через</p>
          <p className="text-sm font-bold text-gold">{timeLeft}</p>
        </Card>
      </div>

      {/* Game area */}
      <div className="text-center mb-8">
        <Card className="card-glow p-8 max-w-sm mx-auto relative overflow-hidden animate-bounce-in">
          <div 
            className="relative cursor-pointer group"
            onClick={handleClick}
          >
            <img 
              src={bulldogSuit}
              alt="BDOG"
              className="w-48 h-48 mx-auto rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Click effects */}
            {clickEffect.map((effect) => (
              <div
                key={effect.id}
                className="absolute pointer-events-none text-gold font-bold text-2xl animate-bounce-in"
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
          
          <p className="text-lg font-semibold text-foreground mt-4">
            Нажми на бульдога!
          </p>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mb-8">
        {boosterEndTime && boosterTimeLeft ? (
          <div className="bg-primary/20 border border-primary/30 rounded-md px-4 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-primary font-semibold">{boosterTimeLeft}</span>
          </div>
        ) : (
          <Button
            onClick={() => setShowBooster(true)}
            className="button-gold group"
          >
            <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Ускорить
          </Button>
        )}
        
        <Button
          onClick={() => setShowRules(true)}
          variant="outline"
          className="button-outline-gold group"
        >
          <Info className="w-4 h-4 mr-2 group-hover:animate-pulse" />
          Правила игры
        </Button>
      </div>

      {/* Ad space */}
      <Card className="card-glow p-4 text-center mb-8 max-w-md mx-auto animate-fade-in-up">
        <p className="text-gray-subtle text-sm mb-1">Твоя реклама тут,</p>
        <a 
          href="https://t.me/Deff0xq" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gold hover:text-gold-light transition-colors underline text-sm font-semibold"
        >
          пиши нам
        </a>
      </Card>

      {/* Top players */}
      {topPlayers.length > 0 && (
        <div className="max-w-md mx-auto animate-slide-in-right" style={{animationDelay: '0.3s'}}>
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">
            Топ роста
          </h3>
          
          <Card className="card-glow p-4">
            <div className="space-y-2">
              {topPlayers.map((player, index) => (
                <div 
                  key={player.name + index} 
                  className="flex justify-between items-center p-2 rounded"
                >
                  <span className="flex items-center">
                    <span className="text-gold font-bold mr-2">#{index + 1}</span>
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