import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pickaxe, TrendingUp, Gamepad2, Play } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

import FloatingCosmicCoins from "@/components/FloatingCosmicCoins";
import { AudioManager } from '@/components/AudioManager';
import bdogLogoTransparent from "@/assets/bulldog-logo-transparent.png";
import bdogMainLogo from "@/assets/bdog-main-logo.jpeg";

const minerTypes = [
  { id: 'default', name: 'DEFOLT', income: 100 },
  { id: 'plus', name: 'PLUS', income: 500 },
  { id: 'silver', name: 'SILVER', income: 1400 },
  { id: 'gold', name: 'GOLD', income: 2500 },
  { id: 'diamond', name: 'DIAMOND', income: 6000 },
  { id: 'premium', name: 'PREMIUM', income: 10000 }
];

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [currentMiner, setCurrentMiner] = useState('default');
  const [minerLevel, setMinerLevel] = useState(1);
  const [vBdogEarned, setVBdogEarned] = useState(0);

  useEffect(() => {
    if (profile) {
      setCurrentMiner((profile as any).current_miner || 'default');
      setMinerLevel((profile as any).miner_level || 1);
      setVBdogEarned((profile as any).v_bdog_earned || 0);
    } else {
      setCurrentMiner(localStorage.getItem("bdog-current-miner") || 'default');
      setMinerLevel(parseInt(localStorage.getItem("bdog-miner-level") || "1"));
    }
  }, [profile]);

  const getCurrentMinerData = () => {
    return minerTypes.find(m => m.id === currentMiner) || minerTypes[0];
  };

  const getCurrentIncome = () => {
    const baseMiner = getCurrentMinerData();
    return Math.floor(baseMiner.income * Math.pow(1.2, minerLevel - 1));
  };

  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingCosmicCoins />
      <AudioManager backgroundMusic={true} volume={0.3} />
      
      <div className="mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src={bdogMainLogo} 
              alt="BDOG" 
              className="w-32 h-32 mx-auto rounded-full shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 20px hsl(var(--gold) / 0.5))'
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-gradient animate-glow-text mb-4">
            BDOG ECOSYSTEM
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Добро пожаловать в космическую экосистему BDOG
          </p>
        </div>

        {/* Current Miner Display */}
        <Card className="card-glow p-6 mb-6 mx-auto">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gold mb-4">Ваш майнер</h2>
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center border-2 border-gold/30">
                <img src={bdogLogoTransparent} alt="BDOG" className="w-14 h-14" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold px-2 py-1 rounded-full">
                LVL {minerLevel}
              </div>
            </div>
            <h3 className="text-lg font-bold text-gold mb-2">
              {getCurrentMinerData().name}
            </h3>
            <p className="text-xl font-bold text-gradient mb-4">
              {getCurrentIncome()} V-BDOG/час
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => navigate('/miner')}
                size="sm"
                className="button-gradient-gold"
              >
                <Pickaxe className="w-4 h-4 mr-1" />
                Купить майнер
              </Button>
              
              <Button
                onClick={() => navigate('/miner')}
                size="sm"
                variant="outline"
                className="border-gold/20 text-gold hover:bg-gold/10"
                disabled={minerLevel >= 5}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Прокачать
              </Button>
            </div>
          </div>
        </Card>

        {/* Game Launch Section */}
        <div className="text-center mb-8">
          <Button
            onClick={handleStartGame}
            size="lg"
            className="button-gradient-gold button-glow text-lg px-8 py-4 hover-lift"
          >
            <Play className="w-6 h-6 mr-3" />
            Начать игру
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mx-auto">
          <Card className="card-glow p-4 text-center">
            <Gamepad2 className="w-8 h-8 text-gold mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">BDOG Game</h3>
            <p className="text-sm text-muted-foreground">Кликайте и зарабатывайте</p>
          </Card>
          
          <Card className="card-glow p-4 text-center">
            <Pickaxe className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Майнеры</h3>
            <p className="text-sm text-muted-foreground">Пассивный доход V-BDOG</p>
          </Card>
          
          <Card className="card-glow p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <img src={bdogLogoTransparent} alt="BDOG" className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Токены</h3>
            <p className="text-sm text-muted-foreground">BDOG и V-BDOG экосистема</p>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="card-glow p-6 mt-8 mx-auto text-center bg-gradient-to-br from-gold/5 to-primary/5 border-gold/20">
          <h2 className="text-xl font-bold text-gradient mb-4">
            Космическая экосистема BDOG
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Исследуйте бесконечные возможности космоса BDOG. Зарабатывайте токены, 
            улучшайте майнеры, участвуйте в играх и строите свою криптоимперию в 
            самой дружелюбной экосистеме блокчейна.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;
