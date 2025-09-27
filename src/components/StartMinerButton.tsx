import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, Zap } from 'lucide-react';

const StartMinerButton: React.FC = () => {
  const { profile, updateProfile } = useProfileContext();
  const [starting, setStarting] = useState(false);

  // Check if miner can be started (purchased but not active)
  const canStartMiner = () => {
    if (!profile) return false;
    return profile.current_miner && profile.current_miner !== 'default' && !profile.miner_active;
  };

  const getMinerIncome = (minerType: string, minerLevel: number) => {
    const incomeRates: { [key: string]: number } = {
      'default': 100,
      'silver': 1400,
      'gold': 2500,
      'diamond': 6000,
      'premium': 10000,
      'plus': 500,
      'stellar': 5000,
      'quantum-harvester': 10000,
      'galactic-harvester': 25000,
      'void-driller': 50000,
      'solar-collector': 100000,
      'bone-extractor': 250000,
    };

    return (incomeRates[minerType] || 100) * minerLevel;
  };

  const handleStartMiner = async () => {
    if (!profile || !canStartMiner()) return;

    setStarting(true);
    try {
      const minerType = profile.current_miner || 'default';
      const minerLevel = profile.miner_level || 1;
      const initialReward = getMinerIncome(minerType, minerLevel);

      // Start miner: give initial reward and set as active
      const updatedProfile = {
        miner_active: true,
        v_bdog_earned: (profile.v_bdog_earned || 0) + initialReward,
        last_miner_reward_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('user_id', profile.user_id);

      if (error) throw error;

      updateProfile(updatedProfile);
      toast.success(`Майнер запущен! Получено ${initialReward.toLocaleString()} V-BDOG`);
    } catch (error: any) {
      console.error('Error starting miner:', error);
      toast.error(error.message || 'Ошибка при запуске майнера');
    } finally {
      setStarting(false);
    }
  };

  // Don't show button if profile not loaded, miner is default, or already active
  if (!profile || profile.current_miner === 'default' || profile.miner_active) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleStartMiner}
        disabled={starting || !canStartMiner()}
        className="flex items-center gap-2 button-gradient-gold button-glow"
        size="lg"
      >
        {starting ? (
          <>
            <Zap className="w-4 h-4 animate-pulse" />
            Запуск...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Запустить майнер
          </>
        )}
      </Button>
      
      {canStartMiner() && (
        <div className="text-sm text-center">
          <div className="text-primary font-medium">
            Получите {getMinerIncome(profile.current_miner || 'default', profile.miner_level || 1).toLocaleString()} V-BDOG
          </div>
          <div className="text-muted-foreground">
            и запустите таймер на 1 час
          </div>
        </div>
      )}
    </div>
  );
};

export default StartMinerButton;