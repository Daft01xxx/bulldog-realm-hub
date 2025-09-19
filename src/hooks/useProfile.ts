import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  wallet_address?: string;
  reg?: string;
  balance: number;
  balance2: number;
  bdog_balance?: number;
  v_bdog_earned?: number;
  grow: number;
  grow1: number;
  bone: number;
  referrals: number;
  referred_by?: string;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate or get user ID from localStorage (simple approach for demo)
  const getUserId = useCallback(() => {
    let userId = localStorage.getItem('bdog-user-id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('bdog-user-id', userId);
    }
    return userId;
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      
      // Try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (existingProfile) {
        setProfile({
          ...existingProfile,
          ip_address: existingProfile.ip_address as string | null
        });
        // Sync with localStorage
        localStorage.setItem('bdog-balance', existingProfile.balance.toString());
        localStorage.setItem('bdog-balance2', existingProfile.balance2.toString());
        if (existingProfile.bdog_balance) {
          localStorage.setItem('bdog-balance-token', existingProfile.bdog_balance.toString());
        }
        if (existingProfile.v_bdog_earned) {
          localStorage.setItem('bdog-v-earned', existingProfile.v_bdog_earned.toString());
        }
        localStorage.setItem('bdog-grow', existingProfile.grow.toString());
        localStorage.setItem('bdog-grow1', existingProfile.grow1.toString());
        localStorage.setItem('bdog-bone', existingProfile.bone.toString());
        if (existingProfile.wallet_address) {
          localStorage.setItem('bdog-api', existingProfile.wallet_address);
        }
        if (existingProfile.reg) {
          localStorage.setItem('bdog-reg', existingProfile.reg);
        }
      } else {
        // Create new profile with referral processing
        const referralCode = localStorage.getItem("bdog-referral-code");
        let referred_by = null;
        
        if (referralCode) {
          // Find the referrer profile
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('reg', referralCode)
            .maybeSingle();
            
          if (referrerProfile) {
            referred_by = referrerProfile.user_id;
            
            // Increment referrer's referral count and calculate reward
            const { data: currentReferrer } = await supabase
              .from('profiles')
              .select('referrals, v_bdog_earned')
              .eq('user_id', referrerProfile.user_id)
              .maybeSingle();
              
            if (currentReferrer) {
              const newReferralCount = (currentReferrer.referrals || 0) + 1;
              
              // Calculate reward based on referral count
              const rewards = [
                { count: 1, reward: 5000 },
                { count: 2, reward: 6000 },
                { count: 3, reward: 7000 },
                { count: 10, reward: 10000 },
                { count: 20, reward: 30000 },
                { count: 50, reward: 100000 },
                { count: 100, reward: 300000 },
              ];
              
              const rewardTier = rewards.find(r => r.count === newReferralCount);
              let balanceIncrease = 0;
              if (rewardTier) {
                balanceIncrease = rewardTier.reward;
              }
              
              // Update referrer
              await supabase
                .from('profiles')
                .update({ 
                  referrals: newReferralCount,
                  v_bdog_earned: (currentReferrer.v_bdog_earned || 0) + balanceIncrease 
                })
                .eq('user_id', referrerProfile.user_id);
            }
          }
          
          // Clear the referral code from localStorage
          localStorage.removeItem("bdog-referral-code");
        }

        const newProfile = {
          user_id: userId,
          reg: `User${Date.now()}`,
          balance: Number(localStorage.getItem('bdog-balance')) || 0,
          balance2: 1000, // Start with 1000 V-BDOG
          bdog_balance: 0, // No BDOG tokens initially  
          v_bdog_earned: 0, // No referral rewards initially
          grow: Number(localStorage.getItem('bdog-grow')) || 0,
          grow1: Number(localStorage.getItem('bdog-grow1')) || 1,
          bone: Number(localStorage.getItem('bdog-bone')) || 1000,
          referrals: 0,
          referred_by,
          wallet_address: localStorage.getItem('bdog-api') || null,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }

        setProfile({
          ...createdProfile,
          ip_address: createdProfile.ip_address as string | null
        });
        localStorage.setItem('bdog-reg', createdProfile.reg);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', profile.user_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      setProfile({
        ...updatedProfile,
        ip_address: updatedProfile.ip_address as string | null
      });

      // Sync with localStorage
      if (updates.balance !== undefined) {
        localStorage.setItem('bdog-balance', updates.balance.toString());
      }
      if (updates.balance2 !== undefined) {
        localStorage.setItem('bdog-balance2', updates.balance2.toString());
      }
      if (updates.grow !== undefined) {
        localStorage.setItem('bdog-grow', updates.grow.toString());
      }
      if (updates.grow1 !== undefined) {
        localStorage.setItem('bdog-grow1', updates.grow1.toString());
      }
      if (updates.bone !== undefined) {
        localStorage.setItem('bdog-bone', updates.bone.toString());
      }
      if (updates.v_bdog_earned !== undefined) {
        localStorage.setItem('bdog-v-earned', updates.v_bdog_earned.toString());
      }
      if (updates.wallet_address !== undefined) {
        if (updates.wallet_address) {
          localStorage.setItem('bdog-api', updates.wallet_address);
        } else {
          localStorage.removeItem('bdog-api');
        }
      }

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [profile]);

  const fetchWalletBalance = useCallback(async (walletAddress: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('tonviewer-api', {
        body: { walletAddress }
      });

      if (error) {
        console.error('Error fetching wallet balance:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось получить баланс кошелька",
          variant: "destructive",
        });
        return null;
      }

      const balance2 = parseFloat(data.bdogBalance || data.tonBalance || "0");
      
      // Update profile with new balance
      await updateProfile({
        bdog_balance: balance2, // BDOG tokens from blockchain
        wallet_address: walletAddress
      });

      toast({
        title: "Баланс обновлен",
        description: `Текущий баланс: ${balance2} BDOG`,
      });

      return data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить баланс кошелька",
        variant: "destructive",
      });
      return null;
    }
  }, [updateProfile, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    updateProfile,
    fetchWalletBalance,
    reloadProfile: loadProfile,
  };
};