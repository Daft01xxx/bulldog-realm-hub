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
  Clock
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
  const [actionHistory, setActionHistory] = useState<MinerAction[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    avgRewardTime: 3600, // seconds
    successRate: 100,
    errorCount: 0
  });

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

  // Real-time efficiency calculation
  const calculateEfficiency = useCallback(() => {
    if (!minerState.isActive) return 0;
    
    const now = Date.now();
    const lastRewardTime = minerState.lastReward?.getTime() || now;
    const timeSinceLastReward = (now - lastRewardTime) / 1000; // seconds
    
    // Efficiency drops over time without maintenance
    let efficiency = 100;
    if (timeSinceLastReward > 7200) { // 2 hours
      efficiency = Math.max(50, 100 - (timeSinceLastReward - 7200) / 3600 * 10);
    }
    
    // Device performance affects efficiency
    if (isVeryLowEnd) efficiency *= 0.8;
    if (isMobile) efficiency *= 0.9;
    
    return Math.round(efficiency);
  }, [minerState.isActive, minerState.lastReward, isVeryLowEnd, isMobile]);

  // Advanced timer system
  useEffect(() => {
    if (!minerState.isActive || minerState.isPaused) return;

    const interval = setInterval(() => {
      setMinerState(prev => {
        const newEfficiency = calculateEfficiency();
        const now = Date.now();
        const lastRewardTime = prev.lastReward?.getTime() || now;
        const nextRewardIn = Math.max(0, 3600 - (now - lastRewardTime) / 1000);
        
        return {
          ...prev,
          efficiency: newEfficiency,
          uptime: prev.uptime + 1,
          nextRewardIn
        };
      });
    }, isVeryLowEnd ? 2000 : 1000);

    return () => clearInterval(interval);
  }, [minerState.isActive, minerState.isPaused, calculateEfficiency, isVeryLowEnd]);

  // Log action to history
  const logAction = useCallback((action: Omit<MinerAction, 'timestamp'>) => {
    setActionHistory(prev => [
      { ...action, timestamp: new Date() },
      ...prev.slice(0, 9) // Keep last 10 actions
    ]);
  }, []);

  // Advanced database operations with error handling
  const performDatabaseOperation = useCallback(async (
    operation: () => Promise<any>,
    actionType: MinerAction['type'],
    successMessage: string
  ) => {
    setIsProcessing(true);
    
    try {
      await operation();
      
      logAction({
        type: actionType,
        result: 'success',
        message: successMessage
      });
      
      toast.success(successMessage);
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        successRate: Math.min(100, prev.successRate + 0.1)
      }));
      
      return true;
      
    } catch (error: any) {
      console.error(`Miner ${actionType} error:`, error);
      
      logAction({
        type: actionType,
        result: 'error',
        message: error.message || 'Неизвестная ошибка'
      });
      
      toast.error(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        successRate: Math.max(0, prev.successRate - 1),
        errorCount: prev.errorCount + 1
      }));
      
      return false;
    } finally {
      setIsProcessing(false);
      await reloadProfile();
    }
  }, [logAction, reloadProfile]);

  // Start miner with advanced logic
  const startMiner = useCallback(async () => {
    if (!profile || minerState.isActive) return;

    const canStart = profile.current_miner && profile.current_miner !== 'default';
    if (!canStart) {
      toast.error('Сначала приобретите майнер');
      return;
    }

    return performDatabaseOperation(
      async () => {
        const incomeRates: { [key: string]: number } = {
          default: 100,
          silver: 250,
          gold: 500,
          diamond: 1000,
          premium: 2000
        };

        const baseIncome = incomeRates[profile.current_miner] || 100;
        const levelMultiplier = profile.miner_level || 1;
        const initialReward = Math.floor(baseIncome * levelMultiplier * 0.1);

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
      },
      'start',
      `Майнер запущен! Получен стартовый бонус`
    );
  }, [profile, minerState.isActive, performDatabaseOperation]);

  // Pause miner
  const pauseMiner = useCallback(async () => {
    if (!profile || !minerState.isActive || minerState.isPaused) return;

    return performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.user_id);

        if (error) throw error;

        setMinerState(prev => ({
          ...prev,
          isPaused: true
        }));
      },
      'pause',
      'Майнер приостановлен'
    );
  }, [profile, minerState.isActive, minerState.isPaused, performDatabaseOperation]);

  // Resume miner
  const resumeMiner = useCallback(async () => {
    if (!profile || !minerState.isActive || !minerState.isPaused) return;

    return performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.user_id);

        if (error) throw error;

        setMinerState(prev => ({
          ...prev,
          isPaused: false
        }));
      },
      'start',
      'Майнер возобновлен'
    );
  }, [profile, minerState.isActive, minerState.isPaused, performDatabaseOperation]);

  // Stop miner completely
  const stopMiner = useCallback(async () => {
    if (!profile || !minerState.isActive) return;

    return performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({
            miner_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.user_id);

        if (error) throw error;

        setMinerState(prev => ({
          ...prev,
          isActive: false,
          isPaused: false,
          uptime: 0
        }));
      },
      'stop',
      'Майнер остановлен'
    );
  }, [profile, minerState.isActive, performDatabaseOperation]);

  // Memoized status display
  const statusDisplay = useMemo(() => {
    if (!minerState.isActive) {
      return {
        status: 'Неактивен',
        color: 'text-muted-foreground',
        icon: <Square className="w-4 h-4" />,
        description: 'Майнер остановлен'
      };
    }

    if (minerState.isPaused) {
      return {
        status: 'Приостановлен',
        color: 'text-yellow-500',
        icon: <Pause className="w-4 h-4" />,
        description: 'Временно приостановлен'
      };
    }

    return {
      status: 'Активен',
      color: 'text-green-500',
      icon: <Activity className="w-4 h-4 animate-pulse" />,
      description: `Эффективность: ${minerState.efficiency}%`
    };
  }, [minerState.isActive, minerState.isPaused, minerState.efficiency]);

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

        {/* Performance Metrics */}
        <div className="bg-surface/30 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Метрики производительности
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Эффективность:</span>
              <div className={`font-medium ${
                minerState.efficiency >= 80 ? 'text-green-500' :
                minerState.efficiency >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {minerState.efficiency}%
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Успешность:</span>
              <div className="font-medium text-primary">
                {performanceMetrics.successRate.toFixed(1)}%
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
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {!minerState.isActive ? (
            <Button
              onClick={startMiner}
              disabled={isProcessing}
              className="button-gold flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Запустить майнер
            </Button>
          ) : (
            <>
              {!minerState.isPaused ? (
                <Button
                  onClick={pauseMiner}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Приостановить
                </Button>
              ) : (
                <Button
                  onClick={resumeMiner}
                  disabled={isProcessing}
                  className="button-gold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Возобновить
                </Button>
              )}
              
              <Button
                onClick={stopMiner}
                disabled={isProcessing}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Остановить
              </Button>
            </>
          )}
        </div>

        {/* Action History */}
        {actionHistory.length > 0 && !isVeryLowEnd && (
          <div className="bg-surface/20 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              История действий
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {actionHistory.map((action, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {action.result === 'success' ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-muted-foreground">
                    {action.timestamp.toLocaleTimeString()}
                  </span>
                  <span>{action.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Count Warning */}
        {performanceMetrics.errorCount > 3 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Обнаружены проблемы с производительностью
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Количество ошибок: {performanceMetrics.errorCount}. 
              Рекомендуется перезапустить майнер.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};