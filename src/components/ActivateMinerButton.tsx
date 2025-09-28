import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, Zap } from 'lucide-react';

const ActivateMinerButton: React.FC = () => {
  const { profile, updateProfile, reloadProfile } = useProfileContext();
  const [starting, setStarting] = useState(false);

  // Check if default miner can be activated
  const canActivateMiner = () => {
    if (!profile) return false;
    return (profile.current_miner === 'default' || !profile.current_miner) && !profile.miner_active;
  };

  const handleActivateMiner = async () => {
    if (!profile || !canActivateMiner()) return;

    setStarting(true);
    try {
      const initialReward = 100; // Default miner income

      console.log('Activating miner for profile:', profile.user_id);

      // Try direct database update first
      const { data, error } = await supabase
        .from('profiles')
        .update({
          miner_active: true,
          current_miner: 'default',
          miner_level: 1,
          v_bdog_earned: (profile.v_bdog_earned || 0) + initialReward,
          last_miner_reward_at: new Date().toISOString(),
        })
        .eq('user_id', profile.user_id)
        .select();

      if (error) {
        console.error('Direct update error:', error);
        
        // Fallback to edge function
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('activate-default-miner', {
          body: { userId: profile.user_id }
        });

        if (edgeError) {
          throw new Error(`Edge function error: ${edgeError.message}`);
        }

        if (!edgeData?.success) {
          throw new Error(edgeData?.error || 'Неизвестная ошибка');
        }
      }

      // Force reload profile from database
      await reloadProfile();
      
      toast.success(`Майнер активирован! Получено ${initialReward.toLocaleString()} V-BDOG`);
    } catch (error: any) {
      console.error('Error activating miner:', error);
      toast.error(`Ошибка при активации майнера: ${error.message || error}`);
    } finally {
      setStarting(false);
    }
  };

  // Don't show button if profile not loaded or miner already active
  if (!profile || profile.miner_active) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleActivateMiner}
        disabled={starting || !canActivateMiner()}
        className="flex items-center gap-2 button-gradient-gold button-glow"
        size="lg"
      >
        {starting ? (
          <>
            <Zap className="w-4 h-4 animate-pulse" />
            Активация...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Активировать майнер
          </>
        )}
      </Button>
      
      {canActivateMiner() && (
        <div className="text-sm text-center">
          <div className="text-primary font-medium">
            Получите 100 V-BDOG
          </div>
          <div className="text-muted-foreground">
            и запустите базовый майнер
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivateMinerButton;