import React, { useEffect } from 'react';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AutoMinerRewards: React.FC = () => {
  const { profile, updateProfile } = useProfileContext();

  useEffect(() => {
    if (!profile) return;

    const checkAndClaimReward = async () => {
      if (!profile.last_miner_reward_at) return;
      
      const lastRewardTime = new Date(profile.last_miner_reward_at);
      const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      const currentTime = new Date();
      
      if (currentTime < nextRewardTime) return;

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

        const reward = (incomeRates[minerType] || 100) * minerLevel;

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

        if (!error) {
          updateProfile(updatedProfile);
          toast.success(`Автоматически получено ${reward} V-BDOG!`, {
            duration: 3000,
          });
        }

      } catch (error) {
        console.error('Auto claim failed:', error);
      }
    };

    // Check every 60 seconds
    const interval = setInterval(checkAndClaimReward, 60000);
    
    // Check immediately on mount
    checkAndClaimReward();

    return () => clearInterval(interval);
  }, [profile, updateProfile]);

  return null; // This component doesn't render anything
};

export default AutoMinerRewards;