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
  device_fingerprint?: string | null;
  booster_expires_at?: string | null; // New field for booster expiration
  created_at: string;
  updated_at: string;
}

interface DeviceInfo {
  ip_address: string;
  device_fingerprint: string;
  user_agent: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get device info (IP + fingerprint) for unique account identification
  const getDeviceInfo = useCallback(async (): Promise<DeviceInfo> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-device-info');
      
      if (error) {
        console.error('Error getting device info:', error);
        // Fallback to basic fingerprint
        return {
          ip_address: '127.0.0.1',
          device_fingerprint: `fallback-${Date.now()}`,
          user_agent: navigator.userAgent || 'unknown'
        };
      }

      return data;
    } catch (error) {
      console.error('Error in getDeviceInfo:', error);
      return {
        ip_address: '127.0.0.1',
        device_fingerprint: `fallback-${Date.now()}`,
        user_agent: navigator.userAgent || 'unknown'
      };
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const deviceInfo = await getDeviceInfo();
      
      console.log('Looking for profile with:', deviceInfo);
      
      // Try to get existing profile by IP + device fingerprint
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('ip_address', deviceInfo.ip_address)
        .eq('device_fingerprint', deviceInfo.device_fingerprint)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile.id);
        
        // Check if booster has expired and reset if necessary
        if (existingProfile.booster_expires_at && new Date(existingProfile.booster_expires_at) <= new Date() && existingProfile.grow1 > 1) {
          console.log('Booster expired, resetting grow1 to 1');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ grow1: 1, booster_expires_at: null })
            .eq('id', existingProfile.id)
            .select()
            .single();
          
          if (!updateError && updatedProfile) {
            existingProfile.grow1 = updatedProfile.grow1;
            existingProfile.booster_expires_at = updatedProfile.booster_expires_at;
          }
        }
        
        setProfile({
          ...existingProfile,
          ip_address: existingProfile.ip_address as string | null,
          device_fingerprint: existingProfile.device_fingerprint as string | null
        });
        // Store user_id in localStorage for backwards compatibility
        localStorage.setItem('bdog-user-id', existingProfile.user_id);
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
        if (existingProfile.booster_expires_at) {
          localStorage.setItem('bdog-booster-expires', existingProfile.booster_expires_at);
        } else {
          localStorage.removeItem('bdog-booster-expires');
        }
        if (existingProfile.wallet_address) {
          localStorage.setItem('bdog-api', existingProfile.wallet_address);
        }
        if (existingProfile.reg) {
          localStorage.setItem('bdog-reg', existingProfile.reg);
        }
      } else {
        console.log('Creating new profile for device:', deviceInfo);
        // Create new profile with referral processing
        const referralCode = localStorage.getItem("bdog-referral-code");
        let referred_by = null;
        
        if (referralCode) {
          // Use secure function to find referrer and get their data safely
          const { data: referrerData } = await supabase.rpc('find_referrer_safely', {
            referral_code: referralCode
          });
            
          if (referrerData && referrerData.length > 0) {
            const referrer = referrerData[0];
            referred_by = referrer.user_id;
            
            const newReferralCount = (referrer.referrals || 0) + 1;
            
            // Fixed reward: 100,000 v-bdog for each referral
            const balanceIncrease = 100000;
            
            // Update referrer
            await supabase
              .from('profiles')
              .update({ 
                referrals: newReferralCount,
                v_bdog_earned: (referrer.v_bdog_earned || 0) + balanceIncrease 
              })
              .eq('user_id', referrer.user_id);
          }
          
          // Clear the referral code from localStorage
          localStorage.removeItem("bdog-referral-code");
        }

        // Generate unique user ID for new profile
        const userId = crypto.randomUUID();
        
        const newProfile = {
          user_id: userId,
          reg: `User${Date.now()}`,
          balance: 0, // Start with 0 balance
          balance2: 0, // Start with 0 V-BDOG
          bdog_balance: 0, // No BDOG tokens initially  
          v_bdog_earned: 0, // No referral rewards initially
          grow: Number(localStorage.getItem('bdog-grow')) || 0,
          grow1: Number(localStorage.getItem('bdog-grow1')) || 1,
          bone: Number(localStorage.getItem('bdog-bone')) || 1000,
          referrals: 0,
          referred_by,
          wallet_address: localStorage.getItem('bdog-api') || null,
          ip_address: deviceInfo.ip_address,
          device_fingerprint: deviceInfo.device_fingerprint,
          booster_expires_at: null, // New profiles don't have active boosters
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
          ip_address: createdProfile.ip_address as string | null,
          device_fingerprint: createdProfile.device_fingerprint as string | null
        });
        // Store user_id in localStorage for backwards compatibility
        localStorage.setItem('bdog-user-id', createdProfile.user_id);
        localStorage.setItem('bdog-reg', createdProfile.reg);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [getDeviceInfo]);

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
        ip_address: updatedProfile.ip_address as string | null,
        device_fingerprint: updatedProfile.device_fingerprint as string | null
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
      if (updates.booster_expires_at !== undefined) {
        if (updates.booster_expires_at) {
          localStorage.setItem('bdog-booster-expires', updates.booster_expires_at);
        } else {
          localStorage.removeItem('bdog-booster-expires');
        }
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