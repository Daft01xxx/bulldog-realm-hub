import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, Loader2 } from 'lucide-react';

export const PromocodeForm: React.FC = () => {
  const [promocode, setPromocode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile, reloadProfile } = useProfileContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promocode.trim()) return;

    if (!profile) {
      toast.error('Профиль не загружен');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const promocodeUpper = promocode.trim().toUpperCase();
      console.log('Processing promocode:', promocodeUpper);

      // Check if promocode exists and is active
      const { data: promocodeData, error: promocodeError } = await supabase
        .from('promocodes')
        .select('id, code, v_bdog_reward, is_active')
        .eq('code', promocodeUpper)
        .eq('is_active', true)
        .maybeSingle();

      if (promocodeError) {
        console.error('Promocode lookup error:', promocodeError);
        toast.error('Ошибка при проверке промокода');
        return;
      }

      if (!promocodeData) {
        toast.error('Промокод не найден или неактивен');
        return;
      }

      // Check if user already used this promocode
      const { data: usageData, error: usageError } = await supabase
        .from('promocode_usage')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('promocode_id', promocodeData.id)
        .maybeSingle();

      if (usageError) {
        console.error('Usage check error:', usageError);
        toast.error('Ошибка при проверке использования промокода');
        return;
      }

      if (usageData) {
        toast.error('Промокод уже использован');
        return;
      }

      // Mark promocode as used
      const { error: insertUsageError } = await supabase
        .from('promocode_usage')
        .insert([{
          user_id: profile.user_id,
          promocode_id: promocodeData.id
        }]);

      if (insertUsageError) {
        console.error('Error marking promocode as used:', insertUsageError);
        toast.error('Ошибка при использовании промокода');
        return;
      }

      // Update user's V-BDOG balance
      const newBalance = (profile.v_bdog_earned || 0) + promocodeData.v_bdog_reward;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          v_bdog_earned: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (updateError) {
        console.error('Error updating balance:', updateError);
        toast.error('Ошибка при начислении награды');
        return;
      }

      // Success!
      toast.success(`Промокод ${promocodeData.code} успешно активирован! Получено ${promocodeData.v_bdog_reward.toLocaleString()} V-BDOG`);
      
      // Reload profile to show updated balance
      await reloadProfile();

    } catch (error: any) {
      console.error('Error processing promocode:', error);
      toast.error(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsSubmitting(false);
      setPromocode('');
    }
  };

  return (
    <Card className="card-glow p-6 max-w-md mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <Gift className="w-8 h-8 text-gold mx-auto mb-2" />
          <h3 className="text-lg font-bold text-foreground">Активация промокода</h3>
          <p className="text-sm text-muted-foreground">
            Введите промокод для получения V-BDOG
          </p>
        </div>
        
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Введите промокод"
            value={promocode}
            onChange={(e) => setPromocode(e.target.value.toUpperCase())}
            className="text-center font-mono text-lg"
            disabled={isSubmitting}
          />
          
          <Button 
            type="submit" 
            className="w-full button-gold"
            disabled={isSubmitting || !promocode.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Активируем...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Активировать
              </>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>• Каждый промокод можно использовать только один раз</p>
          <p>• Награда автоматически добавится на ваш баланс</p>
        </div>
      </form>
    </Card>
  );
};