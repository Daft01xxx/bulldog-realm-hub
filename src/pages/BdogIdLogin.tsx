import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LogIn } from "lucide-react";
import { useProfileContext } from "@/components/ProfileProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BdogIdLogin = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileContext();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      toast.error('Введите BDOG ID, Ник или Email');
      return;
    }

    if (!password.trim()) {
      toast.error('Введите пароль');
      return;
    }

    setLoading(true);
    try {
      // Search for user by BDOG ID, nickname, or email
      let targetProfile = null;
      
      // Try to find by BDOG ID
      const { data: bdogIdProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('bdog_id', identifier)
        .single();

      if (bdogIdProfile) {
        targetProfile = bdogIdProfile;
      } else {
        // Try to find by nickname
        const { data: nicknameProfile } = await supabase
          .from('profiles')
          .select('*')
          .ilike('nickname', identifier)
          .single();

        if (nicknameProfile) {
          targetProfile = nicknameProfile;
        } else {
          // Try to find by email
          const { data: emailProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('verification_email', identifier)
            .single();

          if (emailProfile) {
            targetProfile = emailProfile;
          }
        }
      }

      if (!targetProfile) {
        toast.error('Аккаунт не найден');
        setLoading(false);
        return;
      }

      // Check password
      if (targetProfile.bdog_password !== password) {
        toast.error('Неверный пароль');
        setLoading(false);
        return;
      }

      // Get device info
      const { data: deviceData } = await supabase.functions.invoke('get-device-info');
      
      // Save user_id to localStorage for persistence
      localStorage.setItem('bdog-user-id', targetProfile.user_id);
      
      // Transfer all data from target profile to current profile
      await updateProfile({
        balance: targetProfile.balance,
        balance2: targetProfile.balance2,
        bdog_balance: targetProfile.bdog_balance,
        v_bdog_earned: targetProfile.v_bdog_earned,
        grow: targetProfile.grow,
        grow1: targetProfile.grow1,
        bone: targetProfile.bone,
        referrals: targetProfile.referrals,
        referred_by: targetProfile.referred_by,
        wallet_address: targetProfile.wallet_address,
        reg: targetProfile.reg,
        nickname: targetProfile.nickname,
        current_miner: targetProfile.current_miner,
        miner_level: targetProfile.miner_level,
        miner_active: targetProfile.miner_active,
        completed_tasks: targetProfile.completed_tasks,
        keys: targetProfile.keys,
        bone_farm_record: targetProfile.bone_farm_record,
        verified: targetProfile.verified,
        verification_email: targetProfile.verification_email,
        verification_phone: targetProfile.verification_phone,
        recovery_phrase: targetProfile.recovery_phrase,
        bdog_id: targetProfile.bdog_id,
        bdog_password: targetProfile.bdog_password,
        ip_address: deviceData?.ip_address || profile?.ip_address,
        referral_notifications: targetProfile.referral_notifications,
        booster_expires_at: targetProfile.booster_expires_at
      });

      // Clear active sessions on target profile
      await supabase
        .from('profiles')
        .update({ 
          active_sessions: []
        })
        .eq('user_id', targetProfile.user_id);

      toast.success('Вход выполнен успешно!');
      setTimeout(() => {
        navigate('/menu');
      }, 1000);
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-dark"></div>
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gold hover:text-gold/80"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>

        <Card className="p-8 bg-background/95 backdrop-blur-xl border-gold/20 space-y-6 animate-bounce-in">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-black/20 border-2 border-gold flex items-center justify-center shadow-gold mx-auto mb-4">
              <LogIn className="w-12 h-12 text-gold" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Вход в BDOG ID
            </h1>
            <p className="text-sm text-muted-foreground">
              Введите данные для входа в аккаунт
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                BDOG ID / Ник / Email
              </label>
              <Input
                type="text"
                placeholder="BDOGXXXX... или nickname"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="text-center"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Пароль
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading || !identifier || !password}
            className="w-full bg-gold hover:bg-gold/90 text-black font-semibold py-6 text-lg"
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default BdogIdLogin;
