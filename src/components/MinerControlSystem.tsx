import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Activity, 
  Zap, 
  Timer, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface MinerState {
  isActive: boolean;
  isPaused: boolean;
  efficiency: number;
  uptime: number;
  lastReward: Date | null;
  totalEarned: number;
  currentLevel: number;
  nextRewardIn: number;
}

interface MinerAction {
  type: 'start' | 'pause' | 'stop' | 'upgrade';
  timestamp: Date;
  result: 'success' | 'error';
  message: string;
}

export const MinerControlSystem: React.FC = () => {
  const [minerState, setMinerState] = useState<MinerState>({
    isActive: false,
    isPaused: false,
    efficiency: 100,
    uptime: 0,
    lastReward: null,
    totalEarned: 0,
    currentLevel: 1,
    nextRewardIn: 0
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  const { profile, updateProfile, reloadProfile } = useProfileContext();
  const { isVeryLowEnd, isMobile } = useDevicePerformance();

  // Sync miner state with profile
  useEffect(() => {
    if (profile) {
      setMinerState(prev => ({
        ...prev,
        isActive: profile.miner_active || false,
        currentLevel: profile.miner_level || 1,
        lastReward: profile.last_miner_reward_at ? new Date(profile.last_miner_reward_at) : null,
        totalEarned: profile.v_bdog_earned || 0
      }));
    }
  }, [profile]);

  // Real-time efficiency calculation - miners work continuously at 100%
  const calculateEfficiency = useCallback(() => {
    if (!minerState.isActive) return 0;
    return 100; // Miners always work at 100% efficiency when active
  }, [minerState.isActive]);

  // Continuous timer system - miners work non-stop
  useEffect(() => {
    if (!minerState.isActive) return;

    const interval = setInterval(() => {
      setMinerState(prev => {
        const now = Date.now();
        const lastRewardTime = prev.lastReward?.getTime() || now;
        const nextRewardIn = Math.max(0, 3600 - (now - lastRewardTime) / 1000);
        
        return {
          ...prev,
          efficiency: 100, // Always 100% when active
          uptime: prev.uptime + 1,
          nextRewardIn
        };
      });
    }, isVeryLowEnd ? 2000 : 1000);

    return () => clearInterval(interval);
  }, [minerState.isActive, isVeryLowEnd]);


  // Database operations for miner activation only
  const performDatabaseOperation = useCallback(async (
    operation: () => Promise<any>,
    successMessage: string
  ) => {
    setIsProcessing(true);
    
    try {
      await operation();
      toast.success(successMessage);
      return true;
      
    } catch (error: any) {
      console.error('Miner operation error:', error);
      toast.error(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
      return false;
    } finally {
      setIsProcessing(false);
      await reloadProfile();
    }
  }, [reloadProfile]);

  // Activate miner - works continuously after activation
  const activateMiner = useCallback(async () => {
    if (!profile) return;

    // Check if can activate default miner
    const canActivateDefault = (profile.current_miner === 'default' || !profile.current_miner) && !profile.miner_active;
    // Check if can start purchased miner
    const canStartPurchased = profile.current_miner && profile.current_miner !== 'default' && !profile.miner_active;

    if (!canActivateDefault && !canStartPurchased) {
      if (profile.miner_active) {
        toast.success('Майнер уже работает!');
      } else {
        toast.error('Невозможно активировать майнер');
      }
      return;
    }

    return performDatabaseOperation(
      async () => {
        const incomeRates: { [key: string]: number } = {
          default: 100,
          silver: 1400,
          gold: 2500,
          diamond: 6000,
          premium: 10000,
          plus: 500
        };

        const minerType = profile.current_miner || 'default';
        const baseIncome = incomeRates[minerType] || 100;
        const levelMultiplier = profile.miner_level || 1;
        const initialReward = Math.floor(baseIncome * levelMultiplier * 0.2); // 20% as starting bonus

        const { error } = await supabase
          .from('profiles')
          .update({
            miner_active: true,
            v_bdog_earned: (profile.v_bdog_earned || 0) + initialReward,
            last_miner_reward_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.user_id);

        if (error) throw error;

        setMinerState(prev => ({
          ...prev,
          isActive: true,
          isPaused: false,
          lastReward: new Date()
        }));
        
        return { initialReward, minerType };
      },
      '🚀 Майнер активирован и работает непрерывно!'
    );
  }, [profile, performDatabaseOperation]);


  // Memoized status display - miners work continuously
  const statusDisplay = useMemo(() => {
    if (!minerState.isActive) {
      return {
        status: 'Ожидает активации',
        color: 'text-muted-foreground',
        icon: <Square className="w-4 h-4" />,
        description: 'Майнер готов к запуску'
      };
    }

    return {
      status: 'Работает непрерывно',
      color: 'text-green-500',
      icon: <Activity className="w-4 h-4 animate-pulse" />,
      description: `Производительность: ${minerState.efficiency}% • Автоматические награды каждый час`
    };
  }, [minerState.isActive, minerState.efficiency]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (!profile) {
    return (
      <Card className="card-glow p-6 max-w-md mx-auto">
        <div className="text-center text-muted-foreground">
          Загрузка системы управления майнером...
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-glow p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="w-8 h-8 text-primary animate-slow-spin" />
            <Activity className="w-6 h-6 text-gold animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Система управления майнером
          </h3>
          <p className="text-sm text-muted-foreground">
            Расширенное управление с мониторингом производительности
          </p>
        </div>

        {/* Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {statusDisplay.icon}
              <span className={`font-medium ${statusDisplay.color}`}>
                {statusDisplay.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {statusDisplay.description}
            </p>
          </div>

          <div className="bg-surface/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {formatTime(minerState.uptime)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Время работы
            </p>
          </div>

          <div className="bg-surface/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gold" />
              <span className="font-medium text-gold">
                {minerState.totalEarned.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Всего заработано V-BDOG
            </p>
          </div>
        </div>

        {/* Mining Statistics */}
        <div className="bg-surface/30 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Статистика майнинга
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Производительность:</span>
              <div className="font-medium text-green-500">
                {minerState.efficiency}%
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Тип майнера:</span>
              <div className="font-medium text-primary capitalize">
                {profile?.current_miner || 'default'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Уровень:</span>
              <div className="font-medium text-gold">
                {minerState.currentLevel}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">След. награда:</span>
              <div className="font-medium">
                {formatTime(minerState.nextRewardIn)}
              </div>
            </div>
          </div>
          
          {minerState.isActive && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Майнер работает автономно</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Автоматические награды каждый час. Майнер будет работать непрерывно.
              </p>
            </div>
          )}
        </div>

        {/* Activation Button - Only for inactive miners */}
        {!minerState.isActive && (
          <div className="text-center">
            <Button
              onClick={activateMiner}
              disabled={isProcessing}
              className="button-gold flex items-center gap-2 mx-auto"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Активация...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  {profile?.current_miner === 'default' || !profile?.current_miner 
                    ? 'Активировать базовый майнер' 
                    : `Запустить ${profile.current_miner} майнер`}
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2">
              {profile?.current_miner === 'default' || !profile?.current_miner 
                ? 'Базовый майнер будет работать непрерывно' 
                : 'Майнер будет работать автономно после активации'}
            </p>
          </div>
        )}

        {/* Active Miner Info */}
        {minerState.isActive && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <Activity className="w-4 h-4 animate-pulse text-green-500" />
              <span className="text-green-500 font-medium">Майнер работает автономно</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Награды начисляются автоматически каждый час
            </p>
          </div>
        )}

        {/* Mining Info */}
        {minerState.isActive && (
          <div className="bg-surface/20 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Информация о майнинге
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Время работы:</span>
                <span className="font-medium">{formatTime(minerState.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Последняя награда:</span>
                <span className="font-medium">
                  {minerState.lastReward 
                    ? minerState.lastReward.toLocaleTimeString() 
                    : 'Не получена'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус:</span>
                <span className="font-medium text-green-500">Работает непрерывно</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};