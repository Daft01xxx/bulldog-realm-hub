import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';

const MinerTimer: React.FC = () => {
  const { profile } = useProfile();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      console.log('MinerTimer: profile data:', profile);
      console.log('MinerTimer: last_miner_reward_at:', profile?.last_miner_reward_at);
      
      if (!profile?.last_miner_reward_at) {
        setTimeLeft('00:00:00');
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

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [profile?.last_miner_reward_at]);

  const getCurrentMinerIncome = () => {
    const minerType = profile?.current_miner || 'default';
    const minerLevel = profile?.miner_level || 1;
    
    const incomeRates: { [key: string]: number } = {
      'default': 100,
      'silver': 250,
      'gold': 500,
      'diamond': 1000,
      'premium': 2000,
      'stellar': 5000,
      'quantum-harvester': 10000,
      'galactic-harvester': 25000,
      'void-driller': 50000,
      'solar-collector': 100000,
      'bone-extractor': 250000,
      'plus': 500000,
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