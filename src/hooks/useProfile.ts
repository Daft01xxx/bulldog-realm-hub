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
  referral_notifications?: any;
  current_miner?: string;
  miner_level?: number;
  miner_active?: boolean;
  last_miner_reward_at?: string;
  completed_tasks?: string;
  keys?: number;
  bone_farm_record?: number;
  active_session_id?: string;
  last_activity?: string;
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

  const getDeviceInfo = useCallback(async (): Promise<DeviceInfo> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-device-info');
      
      if (error) throw error;
      return data as DeviceInfo;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        ip_address: 'unknown',
        device_fingerprint: `FB_${Date.now()}_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        user_agent: navigator.userAgent || 'unknown'
      };
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const deviceInfo = await getDeviceInfo();
      
      // First, try to get unique user ID from localStorage
      let uniqueUserId = localStorage.getItem('bdog-unique-user-id');
      
      // If no unique ID exists, generate one
      if (!uniqueUserId) {
        uniqueUserId = crypto.randomUUID();
        localStorage.setItem('bdog-unique-user-id', uniqueUserId);
      }
      
      localStorage.setItem('device-fingerprint', deviceInfo.device_fingerprint);

      // Search for profile by unique user ID first (most reliable)
      let { data: existingProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', uniqueUserId)
        .limit(1);

      if (fetchError) throw fetchError;

      let userProfile = existingProfiles?.[0];

      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      let referrerData = null;

      if (referralCode && !userProfile) {
        const { data: referrerResult, error: referrerError } = await supabase
          .rpc('find_referrer_safely', { referral_code: referralCode });

        if (!referrerError && referrerResult && referrerResult.length > 0) {
          referrerData = referrerResult[0];

          const { data: codeUsageCheck } = await supabase
            .from('profiles')
            .select('id')
            .eq('last_referral_code', referralCode)
            .limit(1);

          if (codeUsageCheck && codeUsageCheck.length > 0) {
            referrerData = null;
          }

          if (referrerData && referrerData.reg === referralCode) {
            referrerData = null;
          }
        }
      }

      if (!userProfile) {
        const regId = `BDOG_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const newProfileData = {
          user_id: uniqueUserId, // Use the unique localStorage ID
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

        if (referrerData) {
          newProfileData.balance = 5000;
          newProfileData.grow = 5000;
          
          await supabase
            .from('profiles')
            .update({ 
              referrals: (referrerData.referrals || 0) + 1,
              v_bdog_earned: (referrerData.v_bdog_earned || 0) + 2500
            })
            .eq('user_id', referrerData.user_id);
        }

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select()
          .single();

        if (createError) throw createError;
        userProfile = newProfile;
      } else {
        const updateData: any = {};
        
        if (userProfile.device_fingerprint !== deviceInfo.device_fingerprint) {
          updateData.device_fingerprint = deviceInfo.device_fingerprint;
        }
        
        if (userProfile.ip_address !== deviceInfo.ip_address) {
          updateData.ip_address = deviceInfo.ip_address;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', userProfile.user_id);
            
          userProfile = { ...userProfile, ...updateData };
        }
      }

      setProfile(userProfile as UserProfile);
    } catch (error) {
      console.error('Error in loadProfile:', error);
      
      const fallbackProfile: UserProfile = {
        id: 'temp-id',
        user_id: 'temp-user-id',
        reg: `TEMP_${Date.now()}`,
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
    } finally {
      setLoading(false);
    }
  }, [getDeviceInfo, toast]);

  // Debounced update with batching
  const updateProfileRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<UserProfile>>({});

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    // Optimistic update - update UI immediately
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    
    // Batch updates
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };
    
    // Clear existing timeout
    if (updateProfileRef.current) {
      clearTimeout(updateProfileRef.current);
    }
    
    // Debounce database save by 500ms
    updateProfileRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(pendingUpdatesRef.current)
          .eq('user_id', profile.user_id);

        if (error) throw error;
        pendingUpdatesRef.current = {};
      } catch (error) {
        console.error('Failed to update profile:', error);
        await reloadProfile();
      }
    }, 500);
  }, [profile]);

  const fetchWalletBalance = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return null;

    try {
      const { data, error } = await supabase.functions.invoke('tonviewer-api', {
        body: { 
          walletAddress,
          action: 'getBalance'
        }
      });

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось получить баланс кошелька",
          variant: "destructive",
        });
        return null;
      }

      const bdogBalance = parseFloat(data.bdogBalance || "0");
      
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

  useEffect(() => {
    let isMounted = true;
    
    const initProfile = async () => {
      if (isMounted && !profile) {
        await loadProfile();
      }
    };
    
    initProfile();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    fetchWalletBalance,
    reloadProfile
  };
};
