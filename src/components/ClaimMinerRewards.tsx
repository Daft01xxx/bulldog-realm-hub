import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift } from 'lucide-react';

const ClaimMinerRewards: React.FC = () => {
  const { profile, updateProfile, loading } = useProfileContext();
  const [claiming, setClaiming] = useState(false);

  const canClaimReward = () => {
    if (!profile?.last_miner_reward_at) return true; // New users can claim immediately
    
    const lastRewardTime = new Date(profile.last_miner_reward_at);
    const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000); // Add 1 hour
    const currentTime = new Date();
    
    return currentTime >= nextRewardTime;
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

  const handleClaimReward = async () => {
    if (!profile) {
      toast.error('Профиль еще загружается, попробуйте снова');
      return;
    }
    
    if (!canClaimReward()) return;

    setClaiming(true);
    try {
      const minerType = profile.current_miner || 'default';
      const minerLevel = profile.miner_level || 1;
      const reward = getMinerIncome(minerType, minerLevel);

      // Update profile with new reward and timestamp
      const updatedProfile = {
        ...profile,
        v_bdog_earned: (profile.v_bdog_earned || 0) + reward,
        last_miner_reward_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          v_bdog_earned: updatedProfile.v_bdog_earned,
          last_miner_reward_at: updatedProfile.last_miner_reward_at,
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      updateProfile(updatedProfile);
      toast.success(`Получено ${reward.toLocaleString()} V-BDOG!`);
    } catch (error: any) {
      console.error('Error claiming miner reward:', error);
      toast.error(error.message || 'Ошибка при получении награды');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          disabled
          className="flex items-center gap-2"
          variant="secondary"
        >
          <Gift className="w-4 h-4" />
          Загрузка...
        </Button>
      </div>
    );
  }

  // Fallback values for new users or when profile is still loading
  const isRewardReady = profile ? canClaimReward() : true;
  const minerType = profile?.current_miner || 'default';
  const minerLevel = profile?.miner_level || 1;
  const reward = getMinerIncome(minerType, minerLevel);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleClaimReward}
        disabled={!isRewardReady || claiming}
        className="flex items-center gap-2"
        variant={isRewardReady ? "default" : "secondary"}
      >
        <Gift className="w-4 h-4" />
        {claiming ? 'Получение...' : isRewardReady ? 'Забрать награду' : 'Награда не готова'}
      </Button>
      
      {isRewardReady && (
        <div className="text-sm text-center">
          <div className="text-primary font-medium">
            +{reward.toLocaleString()} V-BDOG
          </div>
          <div className="text-muted-foreground">
            готово к получению
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimMinerRewards;