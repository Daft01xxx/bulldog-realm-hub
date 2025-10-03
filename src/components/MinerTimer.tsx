import React, { useState, useEffect } from 'react';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const MinerTimer: React.FC = () => {
  const { profile, loading, refreshProfile } = useProfileContext();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = async () => {
      console.log('MinerTimer update - loading:', loading, 'profile:', !!profile, 'miner_active:', profile?.miner_active);
      
      // Show loading only for first 5 seconds
      if (loading && !profile) {
        const startTime = Date.now();
        if (startTime < 5000) {
          setTimeLeft('Загрузка...');
          return;
        }
      }

      // If no profile or miner not active, show appropriate message
      if (!profile?.miner_active) {
        setTimeLeft('Майнер не активен');
        return;
      }
      
      let lastRewardTime: Date;
      
      if (profile.last_miner_reward_at) {
        lastRewardTime = new Date(profile.last_miner_reward_at);
      } else {
        // Fallback for new users - set last reward 50 minutes ago for 10 min countdown
        lastRewardTime = new Date();
        lastRewardTime.setMinutes(lastRewardTime.getMinutes() - 50);
      }
      
      const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      const currentTime = new Date();
      const timeDiff = nextRewardTime.getTime() - currentTime.getTime();

      if (timeDiff <= 0 && !isClaimingReward) {
        // Auto-claim reward
        setIsClaimingReward(true);
        
        try {
          const { data, error } = await supabase.functions.invoke('claim-miner-reward');
          
          if (error) throw error;
          
          if (data.success) {
            toast({
              title: "✅ Награда получена!",
              description: `+${data.reward.toLocaleString()} V-BDOG`,
            });
            
            // Refresh profile to get updated data
            await refreshProfile();
          }
        } catch (error) {
          console.error('Error claiming reward:', error);
        } finally {
          setIsClaimingReward(false);
        }
        
        setTimeLeft('00:00:00');
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
  }, [profile?.last_miner_reward_at, profile?.miner_active, loading, isClaimingReward, refreshProfile]);

  const getCurrentMinerIncome = () => {
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
        <h3 className="text-lg font-semibold text-foreground">Майнер</h3>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-mono font-bold text-primary">
          {timeLeft}
        </div>
        
        {profile?.miner_active ? (
          <>
            <div className="text-sm text-muted-foreground">
              до следующей награды
            </div>
            
            <div className="text-sm font-medium text-foreground">
              +{getCurrentMinerIncome().toLocaleString()} V-BDOG/час
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            {profile ? 'Активируйте майнер для получения дохода' : 'Подключение...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinerTimer;
