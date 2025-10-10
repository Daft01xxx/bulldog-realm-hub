import React, { useEffect } from 'react';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

const AutoMinerRewards: React.FC = () => {
  const { profile, reloadProfile } = useProfileContext();
  const { isVeryLowEnd, isMobile } = useDevicePerformance();

  useEffect(() => {
    if (!profile) return;

    const checkAndClaimReward = async () => {
      if (!profile.last_miner_reward_at) return;
      
      const lastRewardTime = new Date(profile.last_miner_reward_at);
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - lastRewardTime.getTime();
      const hoursPassed = Math.floor(timeDiff / (60 * 60 * 1000));
      
      if (hoursPassed <= 0) return;

      try {
        // Get total income from grid miners
        const { data: gridMiners, error: gridError } = await supabase
          .from('user_miners')
          .select('hourly_income')
          .eq('user_id', profile.user_id)
          .eq('is_on_grid', true);

        if (gridError) throw gridError;

        const totalHourlyIncome = gridMiners?.reduce((sum, miner) => sum + miner.hourly_income, 0) || 0;
        
        if (totalHourlyIncome === 0) return;

        const totalReward = totalHourlyIncome * hoursPassed;
        const newLastRewardTime = new Date(lastRewardTime.getTime() + (hoursPassed * 60 * 60 * 1000));

        const { error } = await supabase
          .from('profiles')
          .update({
            v_bdog_earned: (profile.v_bdog_earned || 0) + totalReward,
            last_miner_reward_at: newLastRewardTime.toISOString(),
          })
          .eq('user_id', profile.user_id);

        if (!error) {
          await reloadProfile();
          if (hoursPassed > 1) {
            toast.success(`Получено ${totalReward.toLocaleString()} V-BDOG за ${hoursPassed} часов!`, {
              duration: 4000,
            });
          } else {
            toast.success(`Получено ${totalReward.toLocaleString()} V-BDOG!`, {
              duration: 3000,
            });
          }
        }
      } catch (error) {
        console.error('Auto claim failed:', error);
      }
    };

    const checkInterval = isVeryLowEnd ? 300000 : isMobile ? 180000 : 60000;

    const interval = setInterval(() => {
      if (!profile?.last_miner_reward_at) return;
      
      const lastRewardTime = new Date(profile.last_miner_reward_at);
      const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000);
      const currentTime = new Date();
      
      if (currentTime >= nextRewardTime) {
        checkAndClaimReward();
      }
    }, checkInterval);
    
    checkAndClaimReward();

    return () => clearInterval(interval);
  }, [profile, reloadProfile, isVeryLowEnd, isMobile]);

  return null;
};

export default AutoMinerRewards;
