import React, { useState, useEffect } from 'react';
import { useProfileContext } from '@/components/ProfileProvider';

const MinerTimer: React.FC = () => {
  const { profile } = useProfileContext();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Show fallback timer if no profile after 2 seconds
    const fallbackTimer = setTimeout(() => {
      if (!profile) {
        setShowFallback(true);
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [profile]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!profile?.last_miner_reward_at) {
        if (showFallback) {
          // Show default countdown for new users
          const defaultTime = new Date();
          defaultTime.setMinutes(defaultTime.getMinutes() + 60); // 1 hour from now
          const currentTime = new Date();
          const timeDiff = defaultTime.getTime() - currentTime.getTime();
          
          if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          } else {
            setTimeLeft('Награда готова!');
          }
        } else {
          setTimeLeft('Загрузка...');
        }
        return;
      }

      const lastRewardTime = new Date(profile.last_miner_reward_at);
      const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      const currentTime = new Date();

      const timeDiff = nextRewardTime.getTime() - currentTime.getTime();

      if (timeDiff <= 0) {
        setTimeLeft('Награда готова!');
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Then update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [profile?.last_miner_reward_at, showFallback]);

  const getCurrentMinerIncome = () => {
    if (!profile && showFallback) return 100; // Default miner income
    if (!profile) return 100;
    
    const minerType = profile?.current_miner || 'default';
    const minerLevel = profile?.miner_level || 1;
    
    const incomeRates: { [key: string]: number } = {
      'default': 100,
      'silver': 1400,
      'gold': 2500,
      'diamond': 6000,
      'premium': 10000,
      'plus': 500,
      // Keep other miners with existing values
      'stellar': 5000,
      'quantum-harvester': 10000,
      'galactic-harvester': 25000,
      'void-driller': 50000,
      'solar-collector': 100000,
      'bone-extractor': 250000,
    };

    return (incomeRates[minerType] || 100) * minerLevel;
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <h3 className="text-lg font-semibold text-foreground">Майнер работает</h3>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-mono font-bold text-primary">
          {timeLeft}
        </div>
        
        <div className="text-sm text-muted-foreground">
          до следующей награды
        </div>
        
        <div className="text-sm font-medium text-foreground">
          +{getCurrentMinerIncome().toLocaleString()} V-BDOG/час
        </div>
      </div>
    </div>
  );
};

export default MinerTimer;
