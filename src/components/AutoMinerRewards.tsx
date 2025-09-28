import React, { useEffect } from 'react';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AutoMinerRewards: React.FC = () => {
  const { profile, updateProfile } = useProfileContext();

  useEffect(() => {
    if (!profile || !profile.miner_active) return; // Only work for active miners

    const checkAndClaimReward = async () => {
      if (!profile.last_miner_reward_at) return;
      
      const lastRewardTime = new Date(profile.last_miner_reward_at);
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - lastRewardTime.getTime();
      const hoursPassed = Math.floor(timeDiff / (60 * 60 * 1000));
      
      if (hoursPassed <= 0) return;

      try {
        const minerType = profile.current_miner || 'default';
        const minerLevel = profile.miner_level || 1;
        
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

        const hourlyReward = (incomeRates[minerType] || 100) * minerLevel;
        const totalReward = hourlyReward * hoursPassed;

        // Calculate new last reward time (aligned to full hours from the original time)
        const newLastRewardTime = new Date(lastRewardTime.getTime() + (hoursPassed * 60 * 60 * 1000));

        // Update profile with accumulated rewards
        const updatedProfile = {
          ...profile,
          v_bdog_earned: (profile.v_bdog_earned || 0) + totalReward,
          last_miner_reward_at: newLastRewardTime.toISOString(),
        };

        const { error } = await supabase
          .from('profiles')
          .update({
            v_bdog_earned: updatedProfile.v_bdog_earned,
            last_miner_reward_at: updatedProfile.last_miner_reward_at,
          })
          .eq('user_id', profile.user_id);

        if (!error) {
          updateProfile(updatedProfile);
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

    // Check every 60 seconds for new rewards
    const interval = setInterval(() => {
      if (!profile?.last_miner_reward_at) return;
      
      const lastRewardTime = new Date(profile.last_miner_reward_at);
      const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000);
      const currentTime = new Date();
      
      if (currentTime >= nextRewardTime) {
        checkAndClaimReward();
      }
    }, 60000);
    
    // Check immediately on mount to catch offline rewards
    checkAndClaimReward();

    return () => clearInterval(interval);
  }, [profile?.miner_active, profile, updateProfile]);

  return null; // This component doesn't render anything
};

export default AutoMinerRewards;