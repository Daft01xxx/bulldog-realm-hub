import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, Loader2, Sparkles, Trophy, Clock, Shield } from 'lucide-react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface PromocodeValidation {
  isValid: boolean;
  format: 'standard' | 'premium' | 'special' | 'invalid';
  strength: number;
  suggestions: string[];
}

interface PromocodeCache {
  [key: string]: {
    data: any;
    timestamp: number;
    expiresAt: number;
  };
}

export const AdvancedPromocodeSystem: React.FC = () => {
  const [promocode, setPromocode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationState, setValidationState] = useState<PromocodeValidation>({
    isValid: false,
    format: 'invalid',
    strength: 0,
    suggestions: []
  });
  const [processingStage, setProcessingStage] = useState('');
  const [cache, setCache] = useState<PromocodeCache>({});
  const [retryCount, setRetryCount] = useState(0);
  
  const { profile, reloadProfile } = useProfileContext();
  const { isMobile, isVeryLowEnd } = useDevicePerformance();

  // Advanced validation with multiple algorithms
  const validatePromocodeFormat = useCallback((code: string): PromocodeValidation => {
    if (!code.trim()) {
      return {
        isValid: false,
        format: 'invalid',
        strength: 0,
        suggestions: ['Введите промокод']
      };
    }

    const normalizedCode = code.trim().toUpperCase();
    const patterns = {
      standard: /^[A-Z0-9]{4,12}$/,
      premium: /^BDOG[A-Z0-9]{4,8}$/,
      special: /^(VIP|GOLD|PREMIUM|ELITE)[A-Z0-9]{3,8}$/
    };

    let format: 'standard' | 'premium' | 'special' | 'invalid' = 'invalid';
    let strength = 0;
    const suggestions: string[] = [];

    if (patterns.special.test(normalizedCode)) {
      format = 'special';
      strength = 95;
    } else if (patterns.premium.test(normalizedCode)) {
      format = 'premium';
      strength = 85;
    } else if (patterns.standard.test(normalizedCode)) {
      format = 'standard';
      strength = 70;
    } else {
      strength = Math.min(normalizedCode.length * 10, 60);
      
      if (normalizedCode.length < 4) {
        suggestions.push('Промокод слишком короткий');
      }
      if (normalizedCode.length > 15) {
        suggestions.push('Промокод слишком длинный');
      }
      if (!/^[A-Z0-9]+$/.test(normalizedCode)) {
        suggestions.push('Используйте только буквы и цифры');
      }
    }

    return {
      isValid: format !== 'invalid',
      format,
      strength,
      suggestions
    };
  }, []);

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setValidationState(validatePromocodeFormat(promocode));
    }, isVeryLowEnd ? 500 : 200);

    return () => clearTimeout(timer);
  }, [promocode, validatePromocodeFormat, isVeryLowEnd]);

  // Cache management
  const getCachedResult = useCallback((code: string) => {
    const cached = cache[code];
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    return null;
  }, [cache]);

  const setCachedResult = useCallback((code: string, data: any, ttl = 300000) => {
    setCache(prev => ({
      ...prev,
      [code]: {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      }
    }));
  }, []);

  // Advanced error handling with exponential backoff
  const handleRetry = useCallback(async (fn: () => Promise<any>, maxRetries = 3) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (i === maxRetries) throw error;
        
        const delay = Math.min(1000 * Math.pow(2, i), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        setRetryCount(prev => prev + 1);
      }
    }
  }, []);

  // Multi-stage processing with detailed feedback
  const processPromocodeAdvanced = useCallback(async (code: string) => {
    if (!profile) {
      toast.error('Профиль не загружен');
      return false;
    }

    const normalizedCode = code.trim().toUpperCase();
    
    // Check cache first
    const cachedResult = getCachedResult(normalizedCode);
    if (cachedResult) {
      if (cachedResult.success) {
        toast.success(`Промокод ${normalizedCode} уже активирован!`);
        return true;
      } else {
        toast.error(cachedResult.message);
        return false;
      }
    }

    setIsProcessing(true);
    setRetryCount(0);

    try {
      // Stage 1: Validation
      setProcessingStage('Проверка формата промокода...');
      await new Promise(resolve => setTimeout(resolve, isVeryLowEnd ? 200 : 100));
      
      if (!validationState.isValid) {
        throw new Error('Неверный формат промокода');
      }

      // Stage 2: Database lookup with retry
      setProcessingStage('Поиск промокода в базе данных...');
      const promocodeData = await handleRetry(async () => {
        const { data, error } = await supabase
          .from('promocodes')
          .select('id, code, v_bdog_reward, is_active')
          .eq('code', normalizedCode)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        return data;
      });

      if (!promocodeData) {
        const result = { success: false, message: 'Промокод не найден или неактивен' };
        setCachedResult(normalizedCode, result);
        throw new Error(result.message);
      }

      // Stage 3: Usage verification
      setProcessingStage('Проверка использования промокода...');
      const usageData = await handleRetry(async () => {
        const { data, error } = await supabase
          .from('promocode_usage')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('promocode_id', promocodeData.id)
          .maybeSingle();

        if (error) throw error;
        return data;
      });

      if (usageData) {
        const result = { success: false, message: 'Промокод уже использован' };
        setCachedResult(normalizedCode, result);
        throw new Error(result.message);
      }

      // Stage 4: Transaction processing
      setProcessingStage('Обработка награды...');
      
      // Use edge function for secure processing
      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('redeem-promocode', {
        body: {
          promocode: normalizedCode,
          device_fingerprint: localStorage.getItem('device-fingerprint') || ''
        }
      });

      if (edgeError) throw edgeError;
      
      if (!edgeResult?.success) {
        throw new Error(edgeResult?.error || 'Ошибка при обработке промокода');
      }

      // Stage 5: Profile update
      setProcessingStage('Обновление профиля...');
      await reloadProfile();

      // Success result caching
      const successResult = { 
        success: true, 
        message: `Получено ${promocodeData.v_bdog_reward.toLocaleString()} V-BDOG`,
        reward: promocodeData.v_bdog_reward
      };
      setCachedResult(normalizedCode, successResult);

      toast.success(
        `🎉 Промокод ${normalizedCode} активирован! Получено ${promocodeData.v_bdog_reward.toLocaleString()} V-BDOG`,
        { duration: 5000 }
      );

      return true;

    } catch (error: any) {
      console.error('Advanced promocode processing error:', error);
      toast.error(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
      return false;
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  }, [profile, validationState.isValid, getCachedResult, setCachedResult, handleRetry, reloadProfile, isVeryLowEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promocode.trim() || isProcessing) return;

    const success = await processPromocodeAdvanced(promocode);
    if (success) {
      setPromocode('');
      setValidationState({
        isValid: false,
        format: 'invalid',
        strength: 0,
        suggestions: []
      });
    }
  };

  // Memoized strength indicator
  const strengthIndicator = useMemo(() => {
    const { strength, format } = validationState;
    let color = 'text-destructive';
    let icon = <Shield className="w-3 h-3" />;
    
    if (strength >= 85) {
      color = 'text-gold';
      icon = <Trophy className="w-3 h-3" />;
    } else if (strength >= 70) {
      color = 'text-primary';
      icon = <Sparkles className="w-3 h-3" />;
    } else if (strength >= 50) {
      color = 'text-muted-foreground';
    }

    return { color, icon, strength, format };
  }, [validationState]);

  return (
    <Card className="card-glow p-6 max-w-md mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="w-8 h-8 text-gold animate-pulse-gold" />
            <Sparkles className="w-6 h-6 text-primary animate-float" />
          </div>
          <h3 className="text-lg font-bold text-foreground animate-glow-text">
            Система активации промокодов
          </h3>
          <p className="text-sm text-muted-foreground">
            Расширенная система с защитой и кэшированием
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Введите промокод"
              value={promocode}
              onChange={(e) => setPromocode(e.target.value.toUpperCase())}
              className={`text-center font-mono text-lg transition-all duration-300 ${
                validationState.isValid 
                  ? 'border-gold shadow-gold/20 shadow-lg' 
                  : promocode && !validationState.isValid
                    ? 'border-destructive/50'
                    : ''
              }`}
              disabled={isProcessing}
              maxLength={15}
            />
            
            {promocode && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className={`flex items-center gap-1 ${strengthIndicator.color}`}>
                  {strengthIndicator.icon}
                  <span className="text-xs font-medium">
                    {strengthIndicator.strength}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {promocode && validationState.suggestions.length > 0 && (
            <div className="text-xs text-muted-foreground space-y-1">
              {validationState.suggestions.map((suggestion, index) => (
                <p key={index} className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  {suggestion}
                </p>
              ))}
            </div>
          )}

          {validationState.isValid && (
            <div className="flex items-center gap-2 text-xs">
              <div className={`px-2 py-1 rounded-full ${
                validationState.format === 'special' 
                  ? 'bg-gold/20 text-gold' 
                  : validationState.format === 'premium'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {validationState.format === 'special' ? '⭐ Специальный' : 
                 validationState.format === 'premium' ? '💎 Премиум' : '🎯 Стандартный'}
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full button-gold relative overflow-hidden"
            disabled={isProcessing || !validationState.isValid}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <div className="flex flex-col items-start">
                  <span>Обработка...</span>
                  {processingStage && (
                    <span className="text-xs opacity-80">{processingStage}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Активировать промокод
                {retryCount > 0 && (
                  <span className="text-xs opacity-80">({retryCount} retry)</span>
                )}
              </div>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Результаты кэшируются для быстрого доступа</span>
          </div>
          <p>• Каждый промокод можно использовать только один раз</p>
          <p>• Награда автоматически добавится на ваш баланс</p>
          <p>• Система поддерживает автоматические повторы при ошибках</p>
        </div>

        {Object.keys(cache).length > 0 && !isVeryLowEnd && (
          <div className="text-xs text-muted-foreground">
            <p>Кэш: {Object.keys(cache).length} записей</p>
          </div>
        )}
      </form>
    </Card>
  );
};