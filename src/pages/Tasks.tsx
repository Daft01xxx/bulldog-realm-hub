import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Gift, Users, MousePointer, Calendar } from 'lucide-react';
import { NotificationToast } from '@/components/NotificationToast';

interface Task {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reward: {
    type: 'v_bdog' | 'bone';
    amount: number;
  };
  requirement: {
    type: 'taps' | 'days' | 'referrals';
    target: number;
  };
  progress: number;
  completed: boolean;
}

export default function Tasks() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);

  // Load completed tasks from localStorage and setup real-time updates
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('bdog-completed-tasks') || '[]');
    setCompletedTasks(completed);
    
    // Update tap count and daily streak
    const updateCounts = () => {
      setTapCount(Number(localStorage.getItem('bdog-total-taps')) || 0);
      setDailyStreak(Number(localStorage.getItem('bdog-daily-streak')) || 0);
    };
    
    updateCounts();
    
    // Check every second for updates
    const interval = setInterval(updateCounts, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTapCount = () => tapCount;
  const getDailyStreak = () => dailyStreak;

  const tasks: Task[] = [
    {
      id: 'task_1000_taps',
      title: 'Сделай 1000 тапов',
      description: `Набери 1000 тапов в игре (${getTapCount()}/1000)`,
      icon: <MousePointer className="h-6 w-6 text-gold" />,
      reward: { type: 'v_bdog', amount: 10000 },
      requirement: { type: 'taps', target: 1000 },
      progress: Math.min(getTapCount(), 1000),
      completed: getTapCount() >= 1000
    },
    {
      id: 'task_daily_2days',
      title: 'Заходи в BDOG APP каждый день',
      description: `Заходи в приложение 2 дня подряд (${getDailyStreak()}/2)`,
      icon: <Calendar className="h-6 w-6 text-gold" />,
      reward: { type: 'bone', amount: 2000 },
      requirement: { type: 'days', target: 2 },
      progress: Math.min(getDailyStreak(), 2),
      completed: getDailyStreak() >= 2
    },
    {
      id: 'task_invite_1friend',
      title: 'Пригласи 1 друга',
      description: `Пригласи друга через реферальную ссылку (${profile?.referrals || 0}/1)`,
      icon: <Users className="h-6 w-6 text-gold" />,
      reward: { type: 'bone', amount: 1000 },
      requirement: { type: 'referrals', target: 1 },
      progress: Math.min(profile?.referrals || 0, 1),
      completed: (profile?.referrals || 0) >= 1
    },
    {
      id: 'task_3000_taps',
      title: 'Сделай 3000 тапов',
      description: `Набери 3000 тапов в игре (${getTapCount()}/3000)`,
      icon: <MousePointer className="h-6 w-6 text-gold" />,
      reward: { type: 'bone', amount: 500 },
      requirement: { type: 'taps', target: 3000 },
      progress: Math.min(getTapCount(), 3000),
      completed: getTapCount() >= 3000
    }
  ];

  const handleClaimReward = async (task: Task) => {
    if (!profile || task.completed && completedTasks.includes(task.id)) return;

    const updates: any = {};
    
    if (task.reward.type === 'v_bdog') {
      updates.v_bdog_earned = (profile.v_bdog_earned || 0) + task.reward.amount;
    } else if (task.reward.type === 'bone') {
      updates.bone = (profile.bone ?? 0) + task.reward.amount;
    }

    await updateProfile(updates);

    const newCompleted = [...completedTasks, task.id];
    setCompletedTasks(newCompleted);
    localStorage.setItem('bdog-completed-tasks', JSON.stringify(newCompleted));

    toast({
      title: "Награда получена!",
      description: `+${task.reward.amount} ${task.reward.type === 'v_bdog' ? 'V-BDOG' : 'косточек'}`,
    });
  };

  const getProgressPercentage = (task: Task) => {
    return (task.progress / task.requirement.target) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background p-4">
      <NotificationToast />
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="button-outline-gold"
          >
            ← Назад
          </Button>
          <h1 className="text-xl font-bold text-center text-gold">Задания</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/menu')}
            className="button-outline-gold"
          >
            Меню
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = task.completed && completedTasks.includes(task.id);
            const canClaim = task.completed && !completedTasks.includes(task.id);
            
            return (
              <Card key={task.id} className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {React.cloneElement(task.icon as React.ReactElement, { 
                          className: "h-6 w-6 icon-gold" 
                        })}
                      </div>
                      <div>
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {task.description}
                        </CardDescription>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Прогресс: {task.progress}/{task.requirement.target}</span>
                      <span>{Math.round(getProgressPercentage(task))}%</span>
                    </div>
                    <Progress value={getProgressPercentage(task)} className="h-2" />
                  </div>

                  {/* Reward and Action */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Gift className="h-3 w-3 icon-gold" />
                      +{task.reward.amount} {task.reward.type === 'v_bdog' ? 'V-BDOG' : 'косточек'}
                    </Badge>
                    
                    {canClaim && (
                      <Button 
                        size="sm" 
                        onClick={() => handleClaimReward(task)}
                        className="button-gradient-gold button-glow"
                      >
                        Забрать награду
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Выполнено
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}