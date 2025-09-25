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
  booster_expires_at?: string | null;
  ban?: number;
  created_at: string;
  updated_at: string;
  is_vpn_user?: boolean;
  referral_code_used?: boolean;
  last_referral_code?: string;
  referral_notifications?: any; // JSON data from database
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
        // Fallback to static fingerprint to avoid constant changes
        return {
          ip_address: '127.0.0.1',
          device_fingerprint: 'fallback-device-static',
          user_agent: navigator.userAgent || 'unknown'
        };
      }

      return data;
    } catch (error) {
      console.error('Error in getDeviceInfo:', error);
      return {
        ip_address: '127.0.0.1',
        device_fingerprint: 'fallback-device-static',
        user_agent: navigator.userAgent || 'unknown'
      };
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    console.log('Starting profile load...');

    try {
      // Get device information
      const deviceInfo = await getDeviceInfo();
      console.log('Device info received:', deviceInfo);

      if (!deviceInfo) {
        throw new Error('Failed to get device information');
      }

      // Check for VPN
      const vpnCheck = await supabase.functions.invoke('detect-vpn', {
        body: { ip_address: deviceInfo.ip_address }
      });

      if (vpnCheck.error) {
        console.error('VPN check failed:', vpnCheck.error);
      }

      const isVpnDetected = vpnCheck.data?.is_vpn || false;
      console.log('VPN detection result:', isVpnDetected);

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

      // Check if user is banned - redirect to ban page FIRST
      if (userProfile && userProfile.ban === 1) {
        console.log('User is banned, clearing data and redirecting to ban page');
        
        // Clear all user data
        localStorage.clear();
        
        // Force redirect to ban page
        setTimeout(() => {
          window.location.href = '/ban';
        }, 100);
        return;
      }

      // Ban VPN users only if they are not explicitly unbanned by admin
      if (isVpnDetected && (!userProfile || userProfile.ban !== 0)) {
        if (userProfile) {
          const { error: banError } = await supabase
            .from('profiles')
            .update({ ban: 1, is_vpn_user: true })
            .eq('id', userProfile.id);
          
          if (banError) {
            console.error('Failed to ban VPN user:', banError);
          }
        }
        
        // Redirect to ban page
        window.location.href = '/ban';
        return;
      }

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
          user_id: crypto.randomUUID(),
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
          bdog_balance: 0,
          v_bdog_earned: 0,
          ban: 0,
          is_vpn_user: isVpnDetected,
          referral_code_used: false,
          last_referral_code: referralCode || null,
          referral_notifications: []
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        userProfile = createdProfile;
        console.log('New profile created:', userProfile);

        // Award referral bonus and send notification
        if (referrerData && !isVpnDetected) {
          console.log('Awarding referral bonus to referrer:', referrerData.user_id);
          
          const notifications = referrerData.referral_notifications || [];
          const newNotification = {
            type: 'new_referral',
            timestamp: new Date().toISOString(),
            message: `Новый реферал зарегистрировался! +100,000 V-BDOG`,
            reg_id: regId,
            read: false
          };

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              referrals: referrerData.referrals + 1,
              v_bdog_earned: referrerData.v_bdog_earned + 100000,
              referral_notifications: [...notifications, newNotification]
            })
            .eq('user_id', referrerData.user_id);

          if (updateError) {
            console.error('Error updating referrer:', updateError);
          } else {
            // Mark referral code as used
            const { error: markUsedError } = await supabase
              .from('profiles')
              .update({ referral_code_used: true })
              .eq('reg', referralCode);
            
            if (markUsedError) {
              console.error('Error marking referral code as used:', markUsedError);
            }
          }
        }
      } else {
        // Update existing profile with new device info if needed
        const updates: any = {};
        
        if (userProfile.device_fingerprint !== deviceInfo.device_fingerprint) {
          updates.device_fingerprint = deviceInfo.device_fingerprint;
        }
        if (userProfile.ip_address !== deviceInfo.ip_address) {
          updates.ip_address = deviceInfo.ip_address;
        }
        
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userProfile.id);
            
          if (updateError) {
            console.error('Error updating existing profile:', updateError);
          }
        }
      }

      // Store profile data - ensure proper conversion from database bigint types
      setProfile({
        ...userProfile,
        grow: Number(userProfile.grow) || 0,
        grow1: Number(userProfile.grow1) || 1,
        bone: Number(userProfile.bone) || 1000,
        balance: Number(userProfile.balance) || 0,
        balance2: Number(userProfile.balance2) || 0,
        v_bdog_earned: Number(userProfile.v_bdog_earned) || 0,
        referrals: Number(userProfile.referrals) || 0,
        ip_address: userProfile.ip_address as string | null,
        device_fingerprint: userProfile.device_fingerprint as string | null
      });
      
      // Sync with localStorage - ensure proper number conversion for bigint values
      localStorage.setItem('bdog-reg', userProfile.reg || '');
      localStorage.setItem('bdog-balance', String(userProfile.balance || 0));
      localStorage.setItem('bdog-balance2', String(userProfile.balance2 || 0));
      localStorage.setItem('bdog-grow', String(Number(userProfile.grow) || 0));
      localStorage.setItem('bdog-grow1', String(Number(userProfile.grow1) || 1));
      localStorage.setItem('bdog-bone', String(Number(userProfile.bone) || 1000));
      localStorage.setItem('bdog-referrals', String(Number(userProfile.referrals) || 0));
      localStorage.setItem('bdog-v-earned', String(Number(userProfile.v_bdog_earned) || 0));

      console.log('Profile loaded successfully:', userProfile);

    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [getDeviceInfo]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) {
      console.warn('No profile available for update');
      return;
    }

    try {
      console.log('Updating profile:', profile.id, 'with updates:', updates);
      
      // For anonymous users, update by device_fingerprint
      // For authenticated users, update by id
      let updateQuery = supabase.from('profiles').update(updates);
      
      if (profile.user_id && profile.user_id !== 'anonymous') {
        updateQuery = updateQuery.eq('id', profile.id);
      } else {
        updateQuery = updateQuery.eq('device_fingerprint', profile.device_fingerprint);
      }
      
      const { data: updatedProfile, error } = await updateQuery
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      console.log('Profile updated successfully:', updatedProfile);
      setProfile({
        ...updatedProfile,
        grow: Number(updatedProfile.grow) || 0,
        grow1: Number(updatedProfile.grow1) || 1,
        bone: Number(updatedProfile.bone) || 1000,
        balance: Number(updatedProfile.balance) || 0,
        balance2: Number(updatedProfile.balance2) || 0,
        v_bdog_earned: Number(updatedProfile.v_bdog_earned) || 0,
        referrals: Number(updatedProfile.referrals) || 0,
        ban: Number(updatedProfile.ban) || 0,
        ip_address: updatedProfile.ip_address as string | null,
        device_fingerprint: updatedProfile.device_fingerprint as string | null
      });

      // Sync with localStorage - ensure proper number conversion
      if (updates.balance !== undefined) {
        localStorage.setItem('bdog-balance', String(Number(updates.balance)));
      }
      if (updates.balance2 !== undefined) {
        localStorage.setItem('bdog-balance2', String(Number(updates.balance2)));
      }
      if (updates.grow !== undefined) {
        localStorage.setItem('bdog-grow', String(Number(updates.grow)));
      }
      if (updates.grow1 !== undefined) {
        localStorage.setItem('bdog-grow1', String(Number(updates.grow1)));
      }
      if (updates.bone !== undefined) {
        localStorage.setItem('bdog-bone', String(Number(updates.bone)));
      }
      if (updates.v_bdog_earned !== undefined) {
        localStorage.setItem('bdog-v-earned', String(Number(updates.v_bdog_earned)));
      }
      if (updates.reg !== undefined) {
        localStorage.setItem('bdog-reg', updates.reg);
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

  const reloadProfile = useCallback(() => {
    setProfile(null);
    loadProfile();
  }, [loadProfile]);

  // Load profile only once on mount, avoid constant reloads
  useEffect(() => {
    if (!profile && !loading) {
      loadProfile();
    }
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    fetchWalletBalance,
    reloadProfile
  };
};