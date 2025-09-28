import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gift, Loader2 } from 'lucide-react';

export const PromocodeForm: React.FC = () => {
  const [promocode, setPromocode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reloadProfile } = useProfileContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promocode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите промокод",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting promocode:', promocode);
      const { data, error } = await supabase.functions.invoke('redeem-promocode', {
        body: { promocode: promocode.trim() }
      });

      console.log('Promocode response - data:', data, 'error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        if (data.reward > 0) {
          toast({
            title: "Успешно!",
            description: `${data.message} Получено ${data.reward.toLocaleString()} V-BDOG!`,
            variant: "default"
          });
          await reloadProfile();
        } else {
          toast({
            title: "Промокод обработан",
            description: "Промокод не найден или недействителен",
            variant: "default"
          });
        }
        setPromocode('');
      } else if (data?.error) {
        toast({
          title: "Ошибка",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Promocode error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при активации промокода",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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