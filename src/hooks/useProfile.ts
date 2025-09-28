import { useState, useEffect, useCallback, useRef } from 'react';
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
  booster_expires_at?: string | null;
  ban?: number;
  created_at: string;
  updated_at: string;
  is_vpn_user?: boolean;
  referral_code_used?: boolean;
  last_referral_code?: string;
  referral_notifications?: any; // JSON data from database
  current_miner?: string;
  miner_level?: number;
  miner_active?: boolean;
  last_miner_reward_at?: string;
  completed_tasks?: string;
  keys?: number;
  bone_farm_record?: number;
}

interface DeviceInfo {
  ip_address: string;
  device_fingerprint: string;
  user_agent: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get device info (IP + fingerprint) for unique account identification
  const getDeviceInfo = useCallback(async (): Promise<DeviceInfo> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-device-info');
      
      if (error) {
        console.error('Error getting device info:', error);
        throw error;
      }

      return data as DeviceInfo;
    } catch (error) {
      console.error('Failed to get device info:', error);
      // Fallback device info
      return {
        ip_address: 'unknown',
        device_fingerprint: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_agent: navigator.userAgent || 'unknown'
      };
    }
  }, []);

  const loadProfile = useCallback(async () => {
    console.log('loadProfile called, current loading state:', loading);
    
    setLoading(true);

    try {
      console.log('Starting profile loading...');
      
      // Get device info for profile identification
      const deviceInfo = await getDeviceInfo();
      console.log('Device info:', deviceInfo);

      // Store device fingerprint in localStorage for promocode functionality
      localStorage.setItem('device-fingerprint', deviceInfo.device_fingerprint);

      // Check if profile exists based on device fingerprint or ip
      let { data: existingProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .or(`device_fingerprint.eq.${deviceInfo.device_fingerprint},ip_address.eq.${deviceInfo.ip_address}`)
        .limit(1);

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      let userProfile = existingProfiles?.[0];
      console.log('Existing profile found:', userProfile);

      // Handle referral logic only for new users
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      let referrerData = null;

      if (referralCode && !userProfile) {
        console.log('Processing referral code:', referralCode);
        
        const { data: referrerResult, error: referrerError } = await supabase
          .rpc('find_referrer_safely', { referral_code: referralCode });

        if (!referrerError && referrerResult && referrerResult.length > 0) {
          referrerData = referrerResult[0];
          console.log('Referrer found:', referrerData);

          // Check if referral code was already used
          const { data: codeUsageCheck } = await supabase
            .from('profiles')
            .select('id')
            .eq('last_referral_code', referralCode)
            .limit(1);

          if (codeUsageCheck && codeUsageCheck.length > 0) {
            console.log('Referral code already used, no reward');
            referrerData = null;
          }

          // Check if it's the referrer themselves
          if (referrerData && referrerData.reg === referralCode) {
            console.log('Self-referral detected, no reward');
            referrerData = null;
          }
        }
      }

      if (!userProfile) {
        // Generate unique registration ID
        const regId = `BDOG${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        
        console.log('Creating new profile with reg:', regId);

        const newProfileData = {
          user_id: crypto.randomUUID(), // Generate random UUID without auth
          reg: regId,
          device_fingerprint: deviceInfo.device_fingerprint,
          ip_address: deviceInfo.ip_address,
          balance: 0,
          balance2: 0,
          grow: 0,
          grow1: 1,
          bone: 1000,
          referrals: 0,
          referred_by: referrerData?.user_id || null,
          ban: 0,
          is_vpn_user: false,
          referral_code_used: !!referralCode,
          last_referral_code: referralCode || null,
          referral_notifications: [],
          current_miner: 'default',
          miner_level: 1,
          miner_active: false,
          last_miner_reward_at: new Date().toISOString(),
          v_bdog_earned: 0,
          bdog_balance: 0,
          completed_tasks: '',
          keys: 3,
          bone_farm_record: 0,
        };

        // If there's a valid referrer, add bonus and update referrer
        if (referrerData) {
          newProfileData.balance = 5000; // Referral bonus
          newProfileData.grow = 5000;
          
          // Update referrer
          const { error: referrerUpdateError } = await supabase
            .from('profiles')
            .update({ 
              referrals: (referrerData.referrals || 0) + 1,
              v_bdog_earned: (referrerData.v_bdog_earned || 0) + 2500
            })
            .eq('user_id', referrerData.user_id);

          if (referrerUpdateError) {
            console.error('Failed to update referrer:', referrerUpdateError);
          } else {
            console.log('Referrer updated with bonus');
          }
        }

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        userProfile = newProfile;
        console.log('New profile created:', userProfile);
      } else {
        // Update existing profile with latest device info if needed
        const updateData: any = {};
        
        if (userProfile.device_fingerprint !== deviceInfo.device_fingerprint) {
          updateData.device_fingerprint = deviceInfo.device_fingerprint;
        }
        
        if (userProfile.ip_address !== deviceInfo.ip_address) {
          updateData.ip_address = deviceInfo.ip_address;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', userProfile.user_id);
            
          if (updateError) {
            console.error('Error updating profile device info:', updateError);
          } else {
            console.log('Profile device info updated');
            userProfile = { ...userProfile, ...updateData };
          }
        }
      }

      setProfile(userProfile as UserProfile);
      console.log('Profile loaded successfully:', userProfile);

    } catch (error) {
      console.error('Error in loadProfile:', error);
      
      // Create fallback profile if loading completely fails
      const fallbackProfile: UserProfile = {
        id: 'temp-id',
        user_id: 'temp-user-id',
        reg: `TEMP${Date.now()}`,
        balance: 0,
        balance2: 0,
        grow: 0,
        grow1: 1,
        bone: 1000,
        referrals: 0,
        v_bdog_earned: 0,
        current_miner: 'default',
        miner_level: 1,
        miner_active: false,
        device_fingerprint: localStorage.getItem('device-fingerprint') || `fallback-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        keys: 3,
        bone_farm_record: 0
      };
      
      setProfile(fallbackProfile);
      console.log('Using fallback profile due to loading error');
      
      // Show error toast only for critical errors
      if (error instanceof Error && !error.message.includes('captcha') && !error.message.includes('network')) {
        toast({
          title: "Информация",
          description: "Работаем в автономном режиме. Некоторые функции могут быть недоступны.",
          variant: "default",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [getDeviceInfo, toast]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', profile.user_id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Update state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  }, [profile, toast]);

  const fetchWalletBalance = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      console.error('No wallet address provided');
      return null;
    }

    try {
      console.log('Fetching wallet balance for:', walletAddress);
      
      const { data, error } = await supabase.functions.invoke('tonviewer-api', {
        body: { 
          walletAddress,
          action: 'getBalance'
        }
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

      const bdogBalance = parseFloat(data.bdogBalance || "0");
      
      // Update profile with new balance and wallet address
      if (profile) {
        await updateProfile({
          bdog_balance: bdogBalance,
          wallet_address: walletAddress
        });
      }

      return data;
    } catch (error) {
      console.error('Error in fetchWalletBalance:', error);
      return null;
    }
  }, [profile, updateProfile, toast]);

  const reloadProfile = useCallback(async () => {
    setProfile(null);
    await loadProfile();
  }, [loadProfile]);

  // Load profile only once on mount to prevent infinite loops
  useEffect(() => {
    let isMounted = true;
    
    const initProfile = async () => {
      console.log('initProfile called, profile exists:', !!profile, 'loading:', loading);
      if (isMounted && !profile) {
        console.log('Starting profile load...');
        await loadProfile();
      }
    };
    
    initProfile();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  return {
    profile,
    loading,
    updateProfile,
    fetchWalletBalance,
    reloadProfile
  };
};