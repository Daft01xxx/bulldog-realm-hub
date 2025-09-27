import React, { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AutoMinerRewards: React.FC = () => {
  const { profile, updateProfile } = useProfile();

  useEffect(() => {
    if (!profile) return;

    const checkAndClaimReward = async () => {
      if (!profile.last_miner_reward_at) return;
      
      const lastRewardTime = new Date(profile.last_miner_reward_at);
      const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      const currentTime = new Date();
      
      if (currentTime < nextRewardTime) return;

      try {
        const { data, error } = await supabase.functions.invoke('claim-miner-reward');
        
        if (error) {
          console.error('Auto claim error:', error);
          return;
        }

        if (data?.success) {
          // Update local profile state
          const updatedProfile = {
            ...profile,
            v_bdog_earned: data.newBalance,
            last_miner_reward_at: new Date().toISOString(),
          };

          updateProfile(updatedProfile);
          toast.success(`Автоматически получено ${data.reward} V-BDOG!`, {
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